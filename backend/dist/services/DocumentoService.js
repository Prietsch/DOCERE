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
exports.DocumentoService = void 0;
const fs_1 = __importDefault(require("fs"));
const GoogleDriveService_1 = require("../services/GoogleDriveService");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const googleDriveService = new GoogleDriveService_1.GoogleDriveService();
class DocumentoService {
    delete(id) {
        throw new Error("Method not implemented.");
    }
    /**
     * Upload de um documento para o Google Drive e criação de registro no banco de dados
     * @param file - Arquivo a ser enviado
     * @param titulo - Título do documento
     * @param aulaId - ID da aula à qual o documento está vinculado
     * @returns Informações do documento criado
     */
    uploadDocumento(file, titulo, aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Determina o tipo do documento com base na extensão do arquivo
                const tipoDocumento = this.getTipoDocumento(file.originalname);
                // Faz o upload do documento para o Google Drive
                const urlDocumento = yield googleDriveService.uploadDocument(file);
                // Cria o registro do documento no banco de dados
                const documento = yield prismaClient_1.default.documento.create({
                    data: {
                        titulo,
                        urlDocumento,
                        tipoDocumento,
                        aulaId,
                    },
                });
                return documento;
            }
            catch (error) {
                console.error("Erro ao fazer upload de documento:", error);
                throw new Error("Falha ao processar o documento");
            }
        });
    }
    /**
     * Obtém todos os documentos de uma aula
     * @param aulaId - ID da aula
     * @returns Lista de documentos
     */
    getDocumentosByAula(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.documento.findMany({
                where: { aulaId },
            });
        });
    }
    /**
     * Exclui um documento
     * @param id - ID do documento a ser excluído
     */
    deleteDocumento(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Busca o documento para obter a URL
                const documento = yield prismaClient_1.default.documento.findUnique({
                    where: { id },
                });
                if (!documento) {
                    throw new Error("Documento não encontrado");
                }
                // Exclui do Google Drive
                if (documento.urlDocumento &&
                    documento.urlDocumento.includes("drive.google.com")) {
                    yield googleDriveService.deleteFile(documento.urlDocumento);
                }
                // Exclui o registro do banco de dados
                yield prismaClient_1.default.documento.delete({
                    where: { id },
                });
            }
            catch (error) {
                console.error("Erro ao excluir documento:", error);
                throw new Error("Falha ao excluir o documento");
            }
        });
    }
    /**
     * Atualiza um documento
     * @param id - ID do documento a ser atualizado
     * @param titulo - Novo título para o documento
     * @returns O documento atualizado
     */
    updateDocumento(id, titulo) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.documento.update({
                where: { id },
                data: { titulo },
            });
        });
    }
    /**
     * Cria um novo documento
     * @param data - Dados do documento a ser criado
     * @returns O documento criado
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Creating documento with data:", data);
                // Validate required fields
                if (!data.titulo || !data.filePath || !data.aulaId) {
                    throw new Error("Título, filePath e aulaId são obrigatórios");
                }
                // Verify the file exists
                if (!fs_1.default.existsSync(data.filePath)) {
                    console.warn(`Arquivo local não encontrado: ${data.filePath}. Pode ser um URL externo.`);
                    // Continue anyway since we might be dealing with an external URL
                }
                // Verify the aula exists
                const aula = yield prismaClient_1.default.aula.findUnique({
                    where: { id: data.aulaId },
                });
                if (!aula) {
                    throw new Error(`Aula com ID ${data.aulaId} não encontrada`);
                }
                // Determine document type based on file extension
                const tipoDocumento = this.getTipoDocumento(data.filePath);
                // Create the document record
                const documento = yield prismaClient_1.default.documento.create({
                    data: {
                        titulo: data.titulo,
                        urlDocumento: data.filePath,
                        tipoDocumento: tipoDocumento,
                        aulaId: data.aulaId,
                    },
                });
                console.log("Document created successfully:", documento);
                return documento;
            }
            catch (error) {
                console.error("Error in DocumentoService.create:", error);
                throw error;
            }
        });
    }
    /**
     * Determina o tipo de documento com base na extensão do arquivo
     * @param filename - Nome do arquivo
     * @returns Tipo do documento
     */
    getTipoDocumento(filename) {
        var _a;
        const extension = ((_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
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
exports.DocumentoService = DocumentoService;
