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
const TipoComentarioService_1 = require("../services/TipoComentarioService");
const router = express_1.default.Router();
const tipoComentarioService = new TipoComentarioService_1.TipoComentarioService();
// GET tipos de comentário por professor
router.get('/professor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tipos = yield tipoComentarioService.findByProfessor(Number(req.params.id));
        res.json(tipos);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// CREATE novo tipo de comentário
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nome, cor, id_professor } = req.body;
        const novoTipo = yield tipoComentarioService.create({
            nome,
            cor,
            id_professor: Number(id_professor),
        });
        res.status(201).json(novoTipo);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// DELETE tipo de comentário
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield tipoComentarioService.delete(Number(req.params.id));
        res.sendStatus(204);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
