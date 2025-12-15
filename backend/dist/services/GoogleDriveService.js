"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveService = void 0;
const fs_1 = __importDefault(require("fs"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const stream_1 = __importDefault(require("stream"));
class GoogleDriveService {
    constructor() {
        // Inicializa o cliente do Google Drive usando credenciais
        try {
            // Verificar existência do arquivo de credenciais
            const keyFilePath = path_1.default.join(__dirname, "../../credentials.json");
            if (!fs_1.default.existsSync(keyFilePath)) {
                console.error(`Arquivo de credenciais não encontrado em: ${keyFilePath}`);
                throw new Error("Arquivo de credenciais do Google Drive não encontrado");
            }
            const auth = new googleapis_1.google.auth.GoogleAuth({
                keyFile: keyFilePath,
                scopes: ["https://www.googleapis.com/auth/drive"],
            });
            this.driveClient = googleapis_1.google.drive({
                version: "v3",
                auth,
            });
            console.log("Google Drive API inicializada com sucesso");
        }
        catch (error) {
            console.error("Erro ao inicializar o Google Drive client:", error);
            throw new Error("Falha ao configurar integração com o Google Drive");
        }
    }
    /**
     * Faz upload de um arquivo para o Google Drive
     * @param fileObject - Objeto com o arquivo a ser enviado
     * @returns URL do arquivo no Google Drive
     */
    uploadFile(fileObject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Pasta onde os vídeos serão armazenados
                const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
                // Verificar se o ID da pasta foi configurado
                if (!folderId) {
                    console.error("Variável de ambiente GOOGLE_DRIVE_FOLDER_ID não configurada");
                    throw new Error("Configuração de pasta do Google Drive ausente");
                }
                console.log(`Iniciando upload de vídeo para a pasta: ${folderId}`);
                // Verificar se a pasta existe antes de tentar fazer upload
                try {
                    yield this.driveClient.files.get({ fileId: folderId });
                }
                catch (error) {
                    console.error(`A pasta com ID ${folderId} não existe ou não está acessível:`, error);
                    throw new Error(`A pasta de destino (${folderId}) não existe ou não está acessível`);
                }
                return this.uploadFileToFolder(fileObject, folderId);
            }
            catch (error) {
                console.error("Erro ao fazer upload para o Google Drive:", error);
                throw new Error(`Falha ao fazer upload do vídeo para o Google Drive: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
            }
        });
    }
    /**
     * Faz upload de um documento para o Google Drive
     * @param fileObject - Objeto com o documento a ser enviado
     * @returns URL do documento no Google Drive
     */
    uploadDocument(fileObject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Pasta onde os documentos serão armazenados
                const folderId = process.env.GOOGLE_DRIVE_FOLDER_DOCS;
                // Verificar se o ID da pasta foi configurado
                if (!folderId) {
                    console.error("Variável de ambiente GOOGLE_DRIVE_FOLDER_DOCS não configurada");
                    throw new Error("Configuração de pasta para documentos do Google Drive ausente");
                }
                console.log(`Iniciando upload de documento para a pasta: ${folderId}`);
                // Verificar se a pasta existe antes de tentar fazer upload
                try {
                    yield this.driveClient.files.get({ fileId: folderId });
                }
                catch (error) {
                    console.error(`A pasta com ID ${folderId} não existe ou não está acessível:`, error);
                    throw new Error(`A pasta de destino (${folderId}) não existe ou não está acessível`);
                }
                return this.uploadFileToFolder(fileObject, folderId);
            }
            catch (error) {
                console.error("Erro ao fazer upload do documento para o Google Drive:", error);
                throw new Error(`Falha ao fazer upload do documento para o Google Drive: ${"Erro desconhecido"}`);
            }
        });
    }
    /**
     * Método base para upload de arquivos para uma pasta específica do Google Drive
     * usando streaming em blocos para reduzir consumo de memória
     * @param fileObject - Objeto com o arquivo a ser enviado
     * @param folderId - ID da pasta no Google Drive (opcional)
     * @returns URL do arquivo no Google Drive
     */
    uploadFileToFolder(fileObject, folderId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let fileStream = null;
            try {
                // Verificar se o arquivo existe
                if (!fs_1.default.existsSync(fileObject.path)) {
                    console.error(`Arquivo temporário não encontrado: ${fileObject.path}`);
                    throw new Error("Arquivo temporário não encontrado");
                }
                console.log(`Preparando upload do arquivo: ${fileObject.originalname} (${fileObject.mimetype}), tamanho: ${(fileObject.size / (1024 * 1024)).toFixed(2)} MB`);
                // Configurar o upload
                const fileMetadata = {
                    name: `${Date.now()}-${fileObject.originalname}`,
                    parents: folderId ? [folderId] : undefined,
                };
                // Usar streaming com tamanho de chunk reduzido para uso eficiente de memória
                fileStream = fs_1.default.createReadStream(fileObject.path, {
                    highWaterMark: 256 * 1024, // 256 KB chunks para reduzir uso de memória
                });
                // Utilizar stream.PassThrough para lidar com backpressure
                const passThrough = new stream_1.default.PassThrough();
                fileStream.pipe(passThrough);
                const media = {
                    mimeType: fileObject.mimetype,
                    body: passThrough,
                };
                console.log(`Enviando arquivo para o Google Drive${folderId ? ` na pasta: ${folderId}` : ""}`);
                // Forçar garbage collection antes de iniciar upload pesado
                if (global.gc) {
                    global.gc();
                    console.log("Garbage collection realizada antes do upload");
                }
                // Usar a versão assíncrona da chamada com chunk menor para melhor gerenciamento de memória
                const response = yield this.driveClient.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: "id,webViewLink",
                }, {
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
                });
                if (!response.data.id) {
                    throw new Error("Falha ao obter ID do arquivo após upload");
                }
                console.log(`Arquivo enviado com sucesso, ID: ${response.data.id}`);
                // Configurar permissões para compartilhamento público
                console.log(`Configurando permissões públicas para o arquivo: ${response.data.id}`);
                yield this.driveClient.permissions.create({
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
                fs_1.default.unlinkSync(fileObject.path);
                const fileUrl = (_a = response.data.webViewLink) !== null && _a !== void 0 ? _a : `https://drive.google.com/file/d/${response.data.id}/view`;
                console.log(`Upload concluído, URL do arquivo: ${fileUrl}`);
                // Forçar coleta de lixo após upload
                if (global.gc) {
                    global.gc();
                    console.log("Garbage collection após upload");
                }
                return fileUrl;
            }
            catch (error) {
                console.error("Erro detalhado ao fazer upload para o Google Drive:", error);
                // Se o erro tem a estrutura do erro que você recebeu (com errors[])
                // if (error?.errors && Array.isArray(error.errors)) {
                //   console.error(`Detalhes do erro: ${JSON.stringify(error.errors)}`);
                // }
                // Fechar o stream se ainda estiver aberto
                if (fileStream) {
                    try {
                        fileStream.destroy();
                    }
                    catch (e) {
                        console.error("Erro ao fechar fileStream:", e);
                    }
                }
                // Tentativa de limpar o arquivo temporário caso ele exista
                try {
                    if (fileObject.path && fs_1.default.existsSync(fileObject.path)) {
                        console.log(`Tentando remover arquivo temporário após erro: ${fileObject.path}`);
                        fs_1.default.unlinkSync(fileObject.path);
                    }
                }
                catch (cleanupError) {
                    console.error("Erro ao limpar arquivo temporário:", cleanupError);
                }
                // Forçar garbage collection
                if (global.gc) {
                    global.gc();
                    console.log("Garbage collection após erro");
                }
                throw new Error(`Falha ao fazer upload do arquivo para o Google Drive: ${"Erro desconhecido"}`);
            }
        });
    }
    /**
     * Exclui um arquivo do Google Drive pelo URL
     * @param fileUrl - URL do arquivo no Google Drive
     */
    deleteFile(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extrair o ID do arquivo da URL
                const fileId = this.extractFileIdFromUrl(fileUrl);
                if (!fileId) {
                    throw new Error("ID do arquivo não encontrado na URL");
                }
                yield this.driveClient.files.delete({
                    fileId: fileId,
                });
            }
            catch (error) {
                console.error("Erro ao excluir arquivo do Google Drive:", error);
                throw new Error("Falha ao excluir arquivo do Google Drive");
            }
        });
    }
    /**
     * Extrai o ID do arquivo do Google Drive a partir da URL
     * @param url - URL do arquivo no Google Drive
     * @returns ID do arquivo
     */ extractFileIdFromUrl(url) {
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
    uploadVideo(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Usar a pasta definida na variável de ambiente ou padrão para vídeos
                const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
                if (!folderId) {
                    console.error("Variável de ambiente GOOGLE_DRIVE_FOLDER_ID não configurada");
                    throw new Error("Configuração de pasta do Google Drive ausente");
                }
                // Utilizamos o método uploadFileToFolder existente para fazer o upload
                return yield this.uploadFileToFolder(file, folderId);
            }
            catch (error) {
                console.error("Error uploading video to Google Drive:", error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to upload video: ${errorMessage}`);
            }
        });
    }
}
exports.GoogleDriveService = GoogleDriveService;
