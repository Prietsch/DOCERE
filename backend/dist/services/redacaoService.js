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
exports.RedacaoService = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class RedacaoService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createData = {
                    tema: data.tema,
                    descricao: data.descricao || null,
                    curso: { connect: { id: data.id_curso } },
                    professor: { connect: { id: data.id_professor } },
                    aula: { connect: { id: data.id_aula } },
                };
                const redacao = yield prismaClient_1.default.redacao.create({
                    data: createData,
                });
                return redacao;
            }
            catch (error) {
                console.error("Error in RedacaoService.create:", error);
                throw error;
            }
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacao.findMany({
                include: {
                    curso: true,
                    professor: true,
                    aula: true,
                    respostas: true,
                    correcao: true,
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacao.findUnique({
                where: { id },
                include: {
                    curso: true,
                    professor: true,
                    aula: true,
                    respostas: true,
                    correcao: true,
                },
            });
        });
    }
    findByAulaId(aulaId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacao.findMany({
                where: { id_aula: aulaId },
                include: {
                    curso: true,
                    professor: true,
                    aula: true,
                    respostas: {
                        include: {
                            aluno: {
                                select: {
                                    nome: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    correcao: true,
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacao.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaClient_1.default.redacao.delete({ where: { id } });
        });
    }
}
exports.RedacaoService = RedacaoService;
