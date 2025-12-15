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
exports.ModuloService = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class ModuloService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.modulo.create({
                data: {
                    nome: data.nome,
                    cursoId: data.cursoId,
                },
            });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.modulo.findMany();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.modulo.findUnique({ where: { id } });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.modulo.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, find related aulas to delete
            const aulas = yield prismaClient_1.default.aula.findMany({
                where: { moduloId: id },
                select: { id: true },
            });
            const aulaIds = aulas.map((aula) => aula.id);
            // Delete module and all related entities in a transaction
            yield prismaClient_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Find questionarios related to aulas
                const questionarios = yield tx.questionario.findMany({
                    where: { aulaId: { in: aulaIds } },
                    select: { id: true },
                });
                const questionarioIds = questionarios.map((q) => q.id);
                // Find perguntas related to questionarios
                const perguntas = yield tx.pergunta.findMany({
                    where: { questionarioId: { in: questionarioIds } },
                    select: { id: true },
                });
                const perguntaIds = perguntas.map((p) => p.id);
                // Find redacoes related to aulas
                const redacoes = yield tx.redacao.findMany({
                    where: { id_aula: { in: aulaIds } },
                    select: { id: true },
                });
                const redacaoIds = redacoes.map((r) => r.id);
                // Find redacao respostas related to redacoes
                const respostas = yield tx.redacaoResposta.findMany({
                    where: { id_redacao: { in: redacaoIds } },
                    select: { id: true },
                });
                const respostaIds = respostas.map((r) => r.id);
                // Delete all related records in the correct order (from children to parents)
                // 1. Delete comentarios redacao
                if (respostaIds.length > 0) {
                    yield tx.comentarioRedacao.deleteMany({
                        where: { id_resposta: { in: respostaIds } },
                    });
                }
                // 2. Delete redacao correcoes
                if (redacaoIds.length > 0 || respostaIds.length > 0) {
                    yield tx.redacaoCorrecao.deleteMany({
                        where: {
                            OR: [
                                { id_redacao: { in: redacaoIds } },
                                { id_redacao_resposta: { in: respostaIds } },
                            ],
                        },
                    });
                }
                // 3. Delete redacao respostas
                if (redacaoIds.length > 0) {
                    yield tx.redacaoResposta.deleteMany({
                        where: { id_redacao: { in: redacaoIds } },
                    });
                }
                // 4. Delete redacoes
                if (aulaIds.length > 0) {
                    yield tx.redacao.deleteMany({
                        where: { id_aula: { in: aulaIds } },
                    });
                }
                // 5. Delete resposta questionario
                if (perguntaIds.length > 0) {
                    yield tx.respostaQuestionario.deleteMany({
                        where: { perguntaId: { in: perguntaIds } },
                    });
                }
                // 6. Delete resposta correta
                if (perguntaIds.length > 0) {
                    yield tx.respostaCorreta.deleteMany({
                        where: { perguntaId: { in: perguntaIds } },
                    });
                }
                // 7. Delete pontuacao questionario
                if (questionarioIds.length > 0) {
                    yield tx.pontuacaoQuestionario.deleteMany({
                        where: { questionarioId: { in: questionarioIds } },
                    });
                }
                // 8. Delete perguntas
                if (questionarioIds.length > 0) {
                    yield tx.pergunta.deleteMany({
                        where: { questionarioId: { in: questionarioIds } },
                    });
                }
                // 9. Delete questionarios
                if (aulaIds.length > 0) {
                    yield tx.questionario.deleteMany({
                        where: { aulaId: { in: aulaIds } },
                    });
                }
                // 10. Delete documentos
                if (aulaIds.length > 0) {
                    yield tx.documento.deleteMany({
                        where: { aulaId: { in: aulaIds } },
                    });
                }
                // 11. Delete formularios
                if (aulaIds.length > 0) {
                    yield tx.formulario.deleteMany({
                        where: { aulaId: { in: aulaIds } },
                    });
                }
                // 12. Delete aulas
                yield tx.aula.deleteMany({
                    where: { moduloId: id },
                });
                // 13. Finally delete the modulo
                yield tx.modulo.delete({
                    where: { id },
                });
            }));
        });
    }
}
exports.ModuloService = ModuloService;
