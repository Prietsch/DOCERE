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
exports.RedacaoRespostaService = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class RedacaoRespostaService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.create({ data });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.findMany({
                include: {
                    redacao: true,
                    aluno: true,
                    correcao: true,
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.findUnique({
                where: { id },
                include: {
                    redacao: true,
                    aluno: true,
                    correcao: true,
                },
            });
        });
    }
    findByAlunoAndRedacao(id_aluno, id_redacao) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.findMany({
                where: {
                    id_aluno,
                    id_redacao,
                },
                include: {
                    redacao: true,
                    aluno: true,
                    correcao: true,
                },
            });
        });
    }
    findByAluno(alunoId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.findMany({
                where: {
                    id_aluno: alunoId,
                },
                include: {
                    redacao: {
                        include: {
                            curso: true,
                            aula: true,
                            professor: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                    aluno: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },
                    correcao: {
                        include: {
                            professor: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                    comentarios: {
                        include: {
                            tipo_comentario: true,
                        },
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.update({
                where: { id },
                data,
                include: {
                    redacao: true,
                    aluno: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },
                    correcao: {
                        include: {
                            professor: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                    comentarios: {
                        include: {
                            tipo_comentario: true,
                        },
                    },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prismaClient_1.default.redacaoResposta.delete({ where: { id } });
        });
    }
    findByIdWithComments(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.redacaoResposta.findUnique({
                where: { id },
                include: {
                    redacao: true,
                    aluno: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },
                    correcao: {
                        include: {
                            professor: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                    comentarios: {
                        include: {
                            tipo_comentario: true,
                        },
                    },
                },
            });
        });
    }
    addComentario(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.comentarioRedacao.create({
                data,
                include: {
                    tipo_comentario: true,
                },
            });
        });
    }
}
exports.RedacaoRespostaService = RedacaoRespostaService;
