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
const ComentarioRedacaoService_1 = require("../services/ComentarioRedacaoService");
const router = express_1.default.Router();
const comentarioService = new ComentarioRedacaoService_1.ComentarioRedacaoService();
// GET comentários por resposta
router.get("/resposta/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comentarios = yield comentarioService.findByResposta(Number(req.params.id));
        if (!comentarios) {
            return res.status(404).json({ error: "No comments found" });
        }
        console.log("Comentários encontrados:", comentarios);
        res.json(comentarios);
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
}));
// CREATE novo comentário
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_resposta, id_tipo_comentario, texto_comentario, posicao_inicio, posicao_fim, } = req.body;
        const novoComentario = yield comentarioService.create({
            id_resposta: Number(id_resposta),
            id_tipo_comentario: Number(id_tipo_comentario),
            texto_comentario,
            posicao_inicio: Number(posicao_inicio),
            posicao_fim: Number(posicao_fim),
        });
        res.status(201).json(novoComentario);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// DELETE comentário
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield comentarioService.delete(Number(req.params.id));
        res.sendStatus(204);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
