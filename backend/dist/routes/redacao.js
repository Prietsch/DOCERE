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
const express_1 = __importDefault(require("express"));
const redacaoService_1 = require("../services/redacaoService");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const router = express_1.default.Router();
const redacaoService = new redacaoService_1.RedacaoService();
// GET all redacaos
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redacoes = yield redacaoService.findAll();
        res.json(redacoes);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET a redacao by id
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redacao = yield redacaoService.findById(Number(req.params.id));
        if (redacao) {
            res.json(redacao);
        }
        else {
            res.status(404).json({ error: "Redação not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET redacao by aula id
router.get("/aula/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aulaId = Number(req.params.id);
        const redacoes = yield redacaoService.findByAulaId(aulaId);
        // Sempre retorne os resultados, mesmo que seja um array vazio
        res.json(redacoes);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET redacoes disponíveis para um aluno
router.get("/aluno/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alunoId = Number(req.params.id);
        // Validar o ID do aluno
        if (!alunoId || isNaN(alunoId)) {
            return res.status(400).json({ error: "ID do aluno inválido" });
        } // Buscar todas as redações que o aluno tem acesso (através dos cursos em que está matriculado)
        const redacoesAluno = yield prismaClient_1.default.redacao.findMany({
            where: {
                curso: {
                    alunos: {
                        some: {
                            id: alunoId,
                        },
                    },
                },
            },
            include: {
                curso: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
                professor: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
                aula: {
                    select: {
                        id: true,
                        titulo: true,
                        moduloId: true,
                    },
                },
                respostas: {
                    where: {
                        id_aluno: alunoId,
                    },
                    select: {
                        id: true,
                        text: true,
                        correcao: {
                            select: {
                                id: true,
                                descricao: true,
                            },
                        },
                    },
                },
            },
        });
        res.json(redacoesAluno);
    }
    catch (error) {
        console.error("Erro ao buscar redações do aluno:", error);
        res.status(500).json({
            error: "Erro ao buscar redações do aluno",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
// GET redacoes respondidas por alunos em cursos de um professor
router.get("/professor/:id/respostas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professorId = Number(req.params.id);
        // Validar o ID do professor
        if (!professorId || isNaN(professorId)) {
            return res.status(400).json({ error: "ID do professor inválido" });
        }
        // Verificar se o professor existe
        const professor = yield prismaClient_1.default.professor.findUnique({
            where: { id: professorId },
        });
        if (!professor) {
            return res.status(404).json({ error: "Professor não encontrado" });
        }
        // Buscar todas as redações respondidas por alunos matriculados nos cursos do professor
        const redacoesRespondidas = yield prismaClient_1.default.redacaoResposta.findMany({
            where: {
                redacao: {
                    id_professor: professorId,
                },
            },
            include: {
                aluno: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                redacao: {
                    include: {
                        curso: {
                            select: {
                                id: true,
                                nome: true,
                            },
                        },
                        aula: {
                            select: {
                                id: true,
                                titulo: true,
                                modulo: {
                                    select: {
                                        id: true,
                                        nome: true,
                                    },
                                },
                            },
                        },
                    },
                },
                correcao: {
                    select: {
                        id: true,
                        descricao: true,
                    },
                },
            },
            orderBy: [{ redacao: { curso: { nome: "asc" } } }],
        });
        return res.status(200).json(redacoesRespondidas);
    }
    catch (error) {
        console.error("Erro ao buscar redações respondidas:", error);
        return res.status(500).json({
            error: "Erro ao buscar redações respondidas por alunos",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
// GET redacoes respondidas por alunos matriculados em um curso específico de um professor
router.get("/professor/:professorId/curso/:cursoId/respostas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professorId = Number(req.params.professorId);
        const cursoId = Number(req.params.cursoId);
        // Validar os IDs
        if (!professorId || isNaN(professorId)) {
            return res.status(400).json({ error: "ID do professor inválido" });
        }
        if (!cursoId || isNaN(cursoId)) {
            return res.status(400).json({ error: "ID do curso inválido" });
        }
        // Verificar se o professor existe
        const professor = yield prismaClient_1.default.professor.findUnique({
            where: { id: professorId },
        });
        if (!professor) {
            return res.status(404).json({ error: "Professor não encontrado" });
        }
        // Verificar se o curso existe e pertence ao professor
        const curso = yield prismaClient_1.default.curso.findFirst({
            where: {
                id: cursoId,
                professorId: professorId,
            },
        });
        if (!curso) {
            return res.status(404).json({
                error: "Curso não encontrado ou não pertence ao professor informado",
            });
        }
        // Buscar todas as redações respondidas por alunos matriculados no curso específico do professor
        const redacoesRespondidas = yield prismaClient_1.default.redacaoResposta.findMany({
            where: {
                redacao: {
                    id_curso: cursoId,
                    id_professor: professorId,
                },
            },
            include: {
                aluno: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                redacao: {
                    include: {
                        curso: {
                            select: {
                                id: true,
                                nome: true,
                            },
                        },
                        aula: {
                            select: {
                                id: true,
                                titulo: true,
                                modulo: {
                                    select: {
                                        id: true,
                                        nome: true,
                                    },
                                },
                            },
                        },
                    },
                },
                correcao: {
                    select: {
                        id: true,
                        descricao: true,
                    },
                },
            },
            orderBy: [{ redacao: { aula: { titulo: "asc" } } }],
        });
        return res.status(200).json(redacoesRespondidas);
    }
    catch (error) {
        console.error("Erro ao buscar redações respondidas do curso:", error);
        return res.status(500).json({
            error: "Erro ao buscar redações respondidas por alunos do curso",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
// CREATE a new redacao
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tema, descricao, id_curso, id_professor, id_aula } = req.body;
        // Validate required fields
        if (!tema || !id_curso || !id_professor || !id_aula) {
            return res.status(400).json({
                error: "Missing required fields",
                required: ["tema", "id_curso", "id_professor", "id_aula"],
                received: req.body,
            });
        }
        console.log("Creating redacao with data:", req.body);
        const newRedacao = yield redacaoService.create({
            tema,
            descricao,
            id_curso: Number(id_curso),
            id_professor: Number(id_professor),
            id_aula: Number(id_aula),
        });
        console.log("Redacao created:", newRedacao);
        res.status(201).json(newRedacao);
    }
    catch (error) {
        console.error("Detailed error creating redacao:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
}));
// UPDATE a redacao
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const updatedRedacao = yield redacaoService.update(Number(req.params.id), data);
        res.json(updatedRedacao);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// DELETE a redacao
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redacaoService.delete(Number(req.params.id));
        res.sendStatus(204);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
