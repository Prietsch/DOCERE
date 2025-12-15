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
const redacaoCorrecaoService_1 = require("../services/redacaoCorrecaoService");
const redacaoRespostaService_1 = require("../services/redacaoRespostaService");
const router = express_1.default.Router();
const respostaService = new redacaoRespostaService_1.RedacaoRespostaService();
const correcaoService = new redacaoCorrecaoService_1.RedacaoCorrecaoService();
// GET all redacao respostas
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const respostas = yield respostaService.findAll();
        res.json(respostas);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET a redacao resposta by id
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resposta = yield respostaService.findById(Number(req.params.id));
        if (resposta) {
            res.json(resposta);
        }
        else {
            res.status(404).json({ error: "Redação resposta not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET redacao respostas by id_aluno and id_redacao
router.get("/aluno/:id_aluno/redacao/:id_redacao", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_aluno, id_redacao } = req.params;
        const respostas = yield respostaService.findByAlunoAndRedacao(Number(id_aluno), Number(id_redacao));
        res.json(respostas);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET todas as redações feitas por um aluno específico
router.get("/aluno/:id/todas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alunoId = Number(req.params.id);
        // Validar o ID do aluno
        if (!alunoId || isNaN(alunoId)) {
            return res.status(400).json({ error: "ID do aluno inválido" });
        }
        // Buscar todas as respostas de redação feitas pelo aluno
        const respostas = yield respostaService.findByAluno(alunoId);
        res.json(respostas);
    }
    catch (error) {
        console.error("Erro ao buscar redações feitas pelo aluno:", error);
        res.status(500).json({
            error: "Erro ao buscar redações feitas pelo aluno",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
// CREATE a new redacao resposta
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_redacao, id_aluno, text, preparation, incubation, illumination, implementation, } = req.body;
        // Validar dados obrigatórios
        if (!id_redacao || !id_aluno) {
            return res
                .status(400)
                .json({ error: "id_redacao e id_aluno são obrigatórios" });
        }
        // O texto pode ser enviado diretamente ou como implementation
        const newResposta = yield respostaService.create({
            id_redacao,
            id_aluno,
            text: text || implementation || "",
            preparation: preparation || null,
            incubation: incubation || null,
            illumination: illumination || null,
            implementation: implementation || text || null,
        });
        res.status(201).json(newResposta);
    }
    catch (error) {
        console.error("Erro ao criar resposta de redação:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// UPDATE a redacao resposta
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, feedback, preparation, incubation, illumination, implementation, } = req.body;
        const id = Number(req.params.id);
        // First, fetch existing response with correction
        const existingResponse = (yield respostaService.findByIdWithComments(id));
        if (!existingResponse) {
            return res.status(404).json({ error: "Resposta não encontrada" });
        }
        // Update response with creative writing fields
        const updateData = {};
        if (text !== undefined)
            updateData.text = text;
        if (preparation !== undefined)
            updateData.preparation = preparation;
        if (incubation !== undefined)
            updateData.incubation = incubation;
        if (illumination !== undefined)
            updateData.illumination = illumination;
        if (implementation !== undefined) {
            updateData.implementation = implementation;
            // If implementation is updated, also update text field to maintain consistency
            if (!updateData.text)
                updateData.text = implementation;
        }
        // If there's data to update in the response
        if (Object.keys(updateData).length > 0) {
            yield respostaService.update(id, updateData);
        }
        // Update or create correction (teacher's feedback)
        if (feedback) {
            if (existingResponse.correcao) {
                yield correcaoService.update(existingResponse.correcao.id, {
                    descricao: feedback,
                });
            }
            else {
                yield correcaoService.create({
                    id_redacao: existingResponse.id_redacao,
                    id_redacao_resposta: id,
                    descricao: feedback,
                    id_professor: req.body.id_professor || 1, // Should be adjusted according to your auth logic
                });
            }
        }
        // Fetch updated response with all relations
        const finalResponse = yield respostaService.findByIdWithComments(id);
        res.json(finalResponse);
    }
    catch (error) {
        console.error("Error updating essay response:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
}));
// DELETE a redacao resposta
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield respostaService.delete(Number(req.params.id));
        res.sendStatus(204);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
