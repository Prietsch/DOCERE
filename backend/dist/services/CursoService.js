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
exports.CursoService = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
class CursoService {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.curso.create({
                data: {
                    nome: data.nome,
                    descricao: data.descricao,
                    professorId: data.professorId,
                    active: true,
                },
            });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.curso.findMany({
                where: {
                    active: true,
                },
                include: {
                    modulos: {
                        include: {
                            aulas: true,
                        },
                    },
                    professor: {
                        select: {
                            nome: true,
                        },
                    },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.curso.findFirst({
                where: {
                    id,
                    active: true,
                },
                include: {
                    modulos: {
                        include: {
                            aulas: true,
                        },
                    },
                    professor: {
                        select: {
                            nome: true,
                            email: true,
                        },
                    },
                    // Inclusão dos alunos por meio dos registros de progressão
                    progress: {
                        include: {
                            aluno: {
                                select: {
                                    id: true,
                                    nome: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.curso.update({ where: { id }, data });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Iniciando soft delete do curso ID: ${id}`);
                // Verificar se o curso existe
                const curso = yield prismaClient_1.default.curso.findUnique({
                    where: { id },
                });
                if (!curso) {
                    throw new Error(`Curso com ID: ${id} não encontrado`);
                }
                // Agora apenas atualizamos o campo active para false em vez de deletar fisicamente
                yield prismaClient_1.default.curso.update({
                    where: { id },
                    data: { active: false },
                });
                console.log(`Curso ID: ${id} marcado como inativo com sucesso!`);
            }
            catch (error) {
                console.error("Erro ao desativar curso:", error);
                throw new Error(`Não foi possível desativar o curso ID: ${id}. Erro: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    // Método para reativar um curso que foi desativado
    reactivate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Reativando curso ID: ${id}`);
                const updatedCurso = yield prismaClient_1.default.curso.update({
                    where: { id },
                    data: { active: true },
                });
                console.log(`Curso ID: ${id} reativado com sucesso!`);
                return updatedCurso;
            }
            catch (error) {
                console.error("Erro ao reativar curso:", error);
                throw new Error(`Não foi possível reativar o curso ID: ${id}. Erro: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    createWithModules(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, description, modules } = data;
            return prismaClient_1.default.curso.create({
                data: {
                    nome: title,
                    descricao: description,
                    professor: data.professor,
                    active: true,
                    modulos: {
                        create: modules.map((module) => ({
                            titulo: module.title,
                            aulas: {
                                create: module.lessons.map((lesson) => ({
                                    titulo: lesson.title,
                                    url_video: lesson.videoUrl,
                                })),
                            },
                        })),
                    },
                },
                include: {
                    modulos: {
                        include: {
                            aulas: true,
                        },
                    },
                },
            });
        });
    }
    findByProfessorId(professorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prismaClient_1.default.curso.findMany({
                where: {
                    professorId,
                    active: true,
                },
                include: {
                    modulos: {
                        include: {
                            aulas: true,
                        },
                    },
                    professor: {
                        select: {
                            nome: true,
                        },
                    },
                },
            });
        });
    }
}
exports.CursoService = CursoService;
