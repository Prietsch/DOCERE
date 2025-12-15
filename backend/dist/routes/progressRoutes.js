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
const auth_1 = require("../middleware/auth");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const router = express_1.default.Router();
// Obter progresso do curso
router.get("/:cursoId", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoId = parseInt(req.params.cursoId);
        const alunoId = req.user.id;
        const progress = yield prismaClient_1.default.progress.findUnique({
            where: {
                cursoId_alunoId: {
                    cursoId,
                    alunoId,
                },
            },
        });
        res.json(progress || { courseProgress: 0, completedLessons: [] });
    }
    catch (error) {
        console.error("Erro ao buscar progresso:", error);
        res.status(500).json({ message: "Erro ao buscar progresso" });
    }
}));
// Atualizar progresso de um curso
router.post("/:cursoId", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoId = parseInt(req.params.cursoId);
        const alunoId = req.user.id;
        const { courseProgress, completedLessons } = req.body;
        const progress = yield prismaClient_1.default.progress.upsert({
            where: {
                cursoId_alunoId: {
                    cursoId,
                    alunoId,
                },
            },
            update: {
                courseProgress,
                completedLessons,
            },
            create: {
                cursoId,
                alunoId,
                courseProgress,
                completedLessons,
            },
        });
        res.json(progress);
    }
    catch (error) {
        console.error("Erro ao atualizar progresso:", error);
        res.status(500).json({ message: "Erro ao atualizar progresso" });
    }
}));
exports.default = router;
