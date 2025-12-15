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
exports.AulaService = void 0;
const GoogleDriveService_1 = require("../services/GoogleDriveService");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const googleDriveService = new GoogleDriveService_1.GoogleDriveService();
class AulaService {
    static findById(aulaId) {
        throw new Error("Method not implemented.");
    }
    create(aulaData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Desestruturação dos dados recebidos
            const { titulo, urlVideo, moduloId } = aulaData;
            // Validar se todos os campos necessários estão presentes
            if (!titulo || !moduloId) {
                throw new Error("Campos obrigatórios não foram fornecidos.");
            }
            return prismaClient_1.default.aula.create({
                data: {
                    titulo: titulo,
                    urlVideo: urlVideo || "",
                    moduloId: moduloId,
                },
            });
        });
    }
    uploadVideo(file, aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Upload do arquivo para o Google Drive
                const googleDriveUrl = yield googleDriveService.uploadFile(file);
                // Se fornecido um ID de aula, atualiza o registro com a nova URL do vídeo
                if (aulaId) {
                    // Busca a aula para verificar se já tem um vídeo associado
                    const aula = yield prismaClient_1.default.aula.findUnique({ where: { id: aulaId } });
                    // Se já existir um vídeo, exclui do Google Drive antes de atualizar
                    if (aula &&
                        aula.urlVideo &&
                        aula.urlVideo.includes("drive.google.com")) {
                        try {
                            yield googleDriveService.deleteFile(aula.urlVideo);
                        }
                        catch (error) {
                            console.error("Erro ao excluir vídeo anterior:", error);
                            // Continua o processo mesmo se falhar ao excluir o vídeo anterior
                        }
                    }
                    // Atualiza a aula com a nova URL do vídeo
                    yield prismaClient_1.default.aula.update({
                        where: { id: aulaId },
                        data: { urlVideo: googleDriveUrl },
                    });
                }
                return googleDriveUrl;
            }
            catch (error) {
                console.error("Erro no upload de vídeo:", error);
                throw new Error("Falha ao fazer upload do vídeo");
            }
        });
    }
    createWithActivity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { titulo, urlVideo = "", moduloId } = data;
            const createdAula = yield prismaClient_1.default.aula.create({
                data: {
                    titulo,
                    urlVideo,
                    moduloId,
                },
            });
            return createdAula;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.aula.findMany();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.aula.findUnique({ where: { id } });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.aula.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Buscar a aula para obter o URL do vídeo
            const aula = yield prismaClient_1.default.aula.findUnique({ where: { id } });
            // Excluir a aula do banco de dados
            yield prismaClient_1.default.aula.delete({ where: { id } });
            // Se existir um vídeo associado e for do Google Drive, excluir do Drive também
            if (aula && aula.urlVideo && aula.urlVideo.includes("drive.google.com")) {
                try {
                    yield googleDriveService.deleteFile(aula.urlVideo);
                }
                catch (error) {
                    console.error("Erro ao excluir vídeo do Google Drive:", error);
                    // Não lança exceção para não interromper o processo se a exclusão do arquivo falhar
                }
            }
        });
    }
}
exports.AulaService = AulaService;
