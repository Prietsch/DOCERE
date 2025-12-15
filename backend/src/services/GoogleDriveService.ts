import fs from "fs";
import { drive_v3, google } from "googleapis";
import path from "path";
import stream from "stream";

// Definindo a interface para global.gc
declare global {
  namespace NodeJS {
    interface Global {
      gc?: () => void;
    }
  }
}

export class GoogleDriveService {
  private readonly driveClient: drive_v3.Drive;

  constructor() {
    // Inicializa o cliente do Google Drive usando credenciais
    try {
      // Verificar existência do arquivo de credenciais
      const keyFilePath = path.join(__dirname, "../../credentials.json");
      if (!fs.existsSync(keyFilePath)) {
        console.error(
          `Arquivo de credenciais não encontrado em: ${keyFilePath}`
        );
        throw new Error(
          "Arquivo de credenciais do Google Drive não encontrado"
        );
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      this.driveClient = google.drive({
        version: "v3",
        auth,
      });

      console.log("Google Drive API inicializada com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar o Google Drive client:", error);
      throw new Error("Falha ao configurar integração com o Google Drive");
    }
  }

  /**
   * Faz upload de um arquivo para o Google Drive
   * @param fileObject - Objeto com o arquivo a ser enviado
   * @returns URL do arquivo no Google Drive
   */
  async uploadFile(fileObject: Express.Multer.File): Promise<string> {
    try {
      // Pasta onde os vídeos serão armazenados
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      // Verificar se o ID da pasta foi configurado
      if (!folderId) {
        console.error(
          "Variável de ambiente GOOGLE_DRIVE_FOLDER_ID não configurada"
        );
        throw new Error("Configuração de pasta do Google Drive ausente");
      }

      console.log(`Iniciando upload de vídeo para a pasta: ${folderId}`);

      // Verificar se a pasta existe antes de tentar fazer upload
      try {
        await this.driveClient.files.get({ fileId: folderId });
      } catch (error) {
        console.error(
          `A pasta com ID ${folderId} não existe ou não está acessível:`,
          error
        );
        throw new Error(
          `A pasta de destino (${folderId}) não existe ou não está acessível`
        );
      }

      return this.uploadFileToFolder(fileObject, folderId);
    } catch (error) {
      console.error("Erro ao fazer upload para o Google Drive:", error);
      throw new Error(
        `Falha ao fazer upload do vídeo para o Google Drive: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Faz upload de um documento para o Google Drive
   * @param fileObject - Objeto com o documento a ser enviado
   * @returns URL do documento no Google Drive
   */
  async uploadDocument(fileObject: Express.Multer.File): Promise<string> {
    try {
      // Pasta onde os documentos serão armazenados
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_DOCS;

      // Verificar se o ID da pasta foi configurado
      if (!folderId) {
        console.error(
          "Variável de ambiente GOOGLE_DRIVE_FOLDER_DOCS não configurada"
        );
        throw new Error(
          "Configuração de pasta para documentos do Google Drive ausente"
        );
      }

      console.log(`Iniciando upload de documento para a pasta: ${folderId}`);

      // Verificar se a pasta existe antes de tentar fazer upload
      try {
        await this.driveClient.files.get({ fileId: folderId });
      } catch (error) {
        console.error(
          `A pasta com ID ${folderId} não existe ou não está acessível:`,
          error
        );
        throw new Error(
          `A pasta de destino (${folderId}) não existe ou não está acessível`
        );
      }

      return this.uploadFileToFolder(fileObject, folderId);
    } catch (error) {
      console.error(
        "Erro ao fazer upload do documento para o Google Drive:",
        error
      );
      throw new Error(
        `Falha ao fazer upload do documento para o Google Drive: ${"Erro desconhecido"}`
      );
    }
  }

  /**
   * Método base para upload de arquivos para uma pasta específica do Google Drive
   * usando streaming em blocos para reduzir consumo de memória
   * @param fileObject - Objeto com o arquivo a ser enviado
   * @param folderId - ID da pasta no Google Drive (opcional)
   * @returns URL do arquivo no Google Drive
   */
  private async uploadFileToFolder(
    fileObject: Express.Multer.File,
    folderId?: string
  ): Promise<string> {
    let fileStream: fs.ReadStream | null = null;

    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(fileObject.path)) {
        console.error(`Arquivo temporário não encontrado: ${fileObject.path}`);
        throw new Error("Arquivo temporário não encontrado");
      }

      console.log(
        `Preparando upload do arquivo: ${fileObject.originalname} (${
          fileObject.mimetype
        }), tamanho: ${(fileObject.size / (1024 * 1024)).toFixed(2)} MB`
      );

      // Configurar o upload
      const fileMetadata: drive_v3.Schema$File = {
        name: `${Date.now()}-${fileObject.originalname}`,
        parents: folderId ? [folderId] : undefined,
      };

      // Usar streaming com tamanho de chunk reduzido para uso eficiente de memória
      fileStream = fs.createReadStream(fileObject.path, {
        highWaterMark: 256 * 1024, // 256 KB chunks para reduzir uso de memória
      });

      // Utilizar stream.PassThrough para lidar com backpressure
      const passThrough = new stream.PassThrough();
      fileStream.pipe(passThrough);

      const media = {
        mimeType: fileObject.mimetype,
        body: passThrough,
      };

      console.log(
        `Enviando arquivo para o Google Drive${
          folderId ? ` na pasta: ${folderId}` : ""
        }`
      );

      // Forçar garbage collection antes de iniciar upload pesado
      if (global.gc) {
        global.gc();
        console.log("Garbage collection realizada antes do upload");
      }

      // Usar a versão assíncrona da chamada com chunk menor para melhor gerenciamento de memória
      const response = await this.driveClient.files.create(
        {
          requestBody: fileMetadata,
          media: media,
          fields: "id,webViewLink",
        },
        {
          // Configurações avançadas para uploads
          onUploadProgress: (evt) => {
            if (evt.bytesRead) {
              const progress = (evt.bytesRead / fileObject.size) * 100;
              if (progress % 10 < 0.1) {
                // Log a cada 10%
                console.log(`Upload progresso: ${progress.toFixed(0)}%`);

                // Liberar memória periodicamente
                if (global.gc) {
                  global.gc();
                  console.log("Garbage collection durante upload");
                }
              }
            }
          },
        }
      );

      if (!response.data.id) {
        throw new Error("Falha ao obter ID do arquivo após upload");
      }

      console.log(`Arquivo enviado com sucesso, ID: ${response.data.id}`);

      // Configurar permissões para compartilhamento público
      console.log(
        `Configurando permissões públicas para o arquivo: ${response.data.id}`
      );
      await this.driveClient.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      // Fechar o stream antes de excluir o arquivo
      if (fileStream) {
        fileStream.destroy();
      }

      // Excluir o arquivo temporário local após o upload
      console.log(`Removendo arquivo temporário: ${fileObject.path}`);
      fs.unlinkSync(fileObject.path);
      const fileUrl =
        response.data.webViewLink ??
        `https://drive.google.com/file/d/${response.data.id}/view`;

      console.log(`Upload concluído, URL do arquivo: ${fileUrl}`);

      // Forçar coleta de lixo após upload
      if (global.gc) {
        global.gc();
        console.log("Garbage collection após upload");
      }

      return fileUrl;
    } catch (error) {
      console.error(
        "Erro detalhado ao fazer upload para o Google Drive:",
        error
      );

      // Se o erro tem a estrutura do erro que você recebeu (com errors[])
      // if (error?.errors && Array.isArray(error.errors)) {
      //   console.error(`Detalhes do erro: ${JSON.stringify(error.errors)}`);
      // }

      // Fechar o stream se ainda estiver aberto
      if (fileStream) {
        try {
          fileStream.destroy();
        } catch (e) {
          console.error("Erro ao fechar fileStream:", e);
        }
      }

      // Tentativa de limpar o arquivo temporário caso ele exista
      try {
        if (fileObject.path && fs.existsSync(fileObject.path)) {
          console.log(
            `Tentando remover arquivo temporário após erro: ${fileObject.path}`
          );
          fs.unlinkSync(fileObject.path);
        }
      } catch (cleanupError) {
        console.error("Erro ao limpar arquivo temporário:", cleanupError);
      }

      // Forçar garbage collection
      if (global.gc) {
        global.gc();
        console.log("Garbage collection após erro");
      }

      throw new Error(
        `Falha ao fazer upload do arquivo para o Google Drive: ${"Erro desconhecido"}`
      );
    }
  }

  /**
   * Exclui um arquivo do Google Drive pelo URL
   * @param fileUrl - URL do arquivo no Google Drive
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extrair o ID do arquivo da URL
      const fileId = this.extractFileIdFromUrl(fileUrl);

      if (!fileId) {
        throw new Error("ID do arquivo não encontrado na URL");
      }

      await this.driveClient.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error("Erro ao excluir arquivo do Google Drive:", error);
      throw new Error("Falha ao excluir arquivo do Google Drive");
    }
  }

  /**
   * Extrai o ID do arquivo do Google Drive a partir da URL
   * @param url - URL do arquivo no Google Drive
   * @returns ID do arquivo
   */ private extractFileIdFromUrl(url: string): string | null {
    // Exemplo de URL do Google Drive: https://drive.google.com/file/d/FILE_ID/view
    const regex = /[-\w]{25,}/;
    const match = regex.exec(url);
    return match ? match[0] : null;
  }
  /**
   * Updates a video for an existing lesson by uploading to Google Drive
   * @param file - The video file to upload
   * @returns URL of the uploaded video
   */
  async uploadVideo(file: Express.Multer.File): Promise<string> {
    try {
      // Usar a pasta definida na variável de ambiente ou padrão para vídeos
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (!folderId) {
        console.error(
          "Variável de ambiente GOOGLE_DRIVE_FOLDER_ID não configurada"
        );
        throw new Error("Configuração de pasta do Google Drive ausente");
      }

      // Utilizamos o método uploadFileToFolder existente para fazer o upload
      return await this.uploadFileToFolder(file, folderId);
    } catch (error: unknown) {
      console.error("Error uploading video to Google Drive:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to upload video: ${errorMessage}`);
    }
  }
}
