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
const router = express_1.default.Router();
const correcaoService = new redacaoCorrecaoService_1.RedacaoCorrecaoService();
// GET all redacao correcaos
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const correcoes = yield correcaoService.findAll();
        res.json(correcoes);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET a redacao correcao by id
router.get("/:id_redacao", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const correcao = yield correcaoService.findById(Number(req.params.id_redacao));
        if (correcao) {
            res.json(correcao);
        }
        else {
            res.status(404).json({ error: "Redação correção not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// CREATE a new redacao correcao
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            id_redacao: req.body.id_redacao,
            id_redacao_resposta: req.body.id_redacao_resposta,
            descricao: req.body.descricao,
            id_professor: req.body.id_professor,
        };
        const newCorrecao = yield correcaoService.create(data);
        res.status(201).json(newCorrecao);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// UPDATE a redacao correcao
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            descricao: req.body.descricao,
        };
        const updatedCorrecao = yield correcaoService.update(Number(req.params.id), data);
        res.json(updatedCorrecao);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// DELETE a redacao correcao
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield correcaoService.delete(Number(req.params.id));
        res.sendStatus(204);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
