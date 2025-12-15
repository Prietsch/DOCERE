import { Documento } from "@prisma/client";
import fs from "fs";
import { GoogleDriveService } from "../services/GoogleDriveService";
import prisma from "../utils/prismaClient";

const googleDriveService = new GoogleDriveService();

export class DocumentoService {
  delete(id: number) {
    throw new Error("Method not implemented.");
  }
  /**
   * Upload de um documento para o Google Drive e criação de registro no banco de dados
   * @param file - Arquivo a ser enviado
   * @param titulo - Título do documento
   * @param aulaId - ID da aula à qual o documento está vinculado
   * @returns Informações do documento criado
   */
  async uploadDocumento(
    file: Express.Multer.File,
    titulo: string,
    aulaId: number
  ): Promise<Documento> {
    try {
      // Determina o tipo do documento com base na extensão do arquivo
      const tipoDocumento = this.getTipoDocumento(file.originalname);

      // Faz o upload do documento para o Google Drive
      const urlDocumento = await googleDriveService.uploadDocument(file);

      // Cria o registro do documento no banco de dados
      const documento = await prisma.documento.create({
        data: {
          titulo,
          urlDocumento,
          tipoDocumento,
          aulaId,
        },
      });

      return documento;
    } catch (error) {
      console.error("Erro ao fazer upload de documento:", error);
      throw new Error("Falha ao processar o documento");
    }
  }

  /**
   * Obtém todos os documentos de uma aula
   * @param aulaId - ID da aula
   * @returns Lista de documentos
   */
  async getDocumentosByAula(aulaId: number): Promise<Documento[]> {
    return prisma.documento.findMany({
      where: { aulaId },
    });
  }

  /**
   * Exclui um documento
   * @param id - ID do documento a ser excluído
   */
  async deleteDocumento(id: number): Promise<void> {
    try {
      // Busca o documento para obter a URL
      const documento = await prisma.documento.findUnique({
        where: { id },
      });

      if (!documento) {
        throw new Error("Documento não encontrado");
      }

      // Exclui do Google Drive
      if (
        documento.urlDocumento &&
        documento.urlDocumento.includes("drive.google.com")
      ) {
        await googleDriveService.deleteFile(documento.urlDocumento);
      }

      // Exclui o registro do banco de dados
      await prisma.documento.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      throw new Error("Falha ao excluir o documento");
    }
  }

  /**
   * Atualiza um documento
   * @param id - ID do documento a ser atualizado
   * @param titulo - Novo título para o documento
   * @returns O documento atualizado
   */
  async updateDocumento(id: number, titulo: string): Promise<Documento> {
    return prisma.documento.update({
      where: { id },
      data: { titulo },
    });
  }

  /**
   * Cria um novo documento
   * @param data - Dados do documento a ser criado
   * @returns O documento criado
   */
  async create(data: {
    titulo: string;
    filePath: string;
    aulaId: number;
  }): Promise<Documento> {
    try {
      console.log("Creating documento with data:", data);

      // Validate required fields
      if (!data.titulo || !data.filePath || !data.aulaId) {
        throw new Error("Título, filePath e aulaId são obrigatórios");
      }

      // Verify the file exists
      if (!fs.existsSync(data.filePath)) {
        console.warn(
          `Arquivo local não encontrado: ${data.filePath}. Pode ser um URL externo.`
        );
        // Continue anyway since we might be dealing with an external URL
      }

      // Verify the aula exists
      const aula = await prisma.aula.findUnique({
        where: { id: data.aulaId },
      });

      if (!aula) {
        throw new Error(`Aula com ID ${data.aulaId} não encontrada`);
      }

      // Determine document type based on file extension
      const tipoDocumento = this.getTipoDocumento(data.filePath);

      // Create the document record
      const documento = await prisma.documento.create({
        data: {
          titulo: data.titulo,
          urlDocumento: data.filePath,
          tipoDocumento: tipoDocumento,
          aulaId: data.aulaId,
        },
      });

      console.log("Document created successfully:", documento);
      return documento;
    } catch (error) {
      console.error("Error in DocumentoService.create:", error);
      throw error;
    }
  }

  /**
   * Determina o tipo de documento com base na extensão do arquivo
   * @param filename - Nome do arquivo
   * @returns Tipo do documento
   */
  private getTipoDocumento(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || "";

    switch (extension) {
      case "pdf":
        return "PDF";
      case "doc":
      case "docx":
        return "Word";
      case "xls":
      case "xlsx":
        return "Excel";
      case "ppt":
      case "pptx":
        return "PowerPoint";
      case "txt":
        return "Texto";
      case "jpg":
      case "jpeg":
      case "png":
        return "Imagem";
      default:
        return "Outro";
    }
  }
}
