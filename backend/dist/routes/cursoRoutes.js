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
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const AulaService_1 = require("../services/AulaService");
const CursoService_1 = require("../services/CursoService");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const router = express_1.default.Router();
const cursoService = new CursoService_1.CursoService();
const aulaService = new AulaService_1.AulaService();
// Update storage configuration para armazenar temporariamente os arquivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), "temp");
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB in bytes
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "video/mp4") {
            cb(null, true);
        }
        else {
            cb(new Error("Only MP4 files are allowed"));
        }
    },
});
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const curso = yield cursoService.create(req.body);
        res.status(201).json(curso);
    }
    catch (error) {
        console.error("Error creating curso:", error);
        res.status(500).json({ error: "Error creating curso" });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const professorId = req.query.professorId
            ? Number(req.query.professorId)
            : undefined;
        const cursos = professorId
            ? yield cursoService.findByProfessorId(professorId)
            : yield cursoService.findAll();
        res.json(cursos);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching cursos" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const curso = yield cursoService.findById(Number(req.params.id));
        if (curso) {
            res.json(curso);
        }
        else {
            res.status(404).json({ error: "Curso not found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching curso" });
    }
}));
router.get("/:id/alunos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = Number(req.params.id);
        const alunoId = req.query.alunoId ? Number(req.query.alunoId) : null;
        if (alunoId) {
            // Get specific student progress
            let progressRecord = yield prismaClient_1.default.progress.findUnique({
                where: {
                    cursoId_alunoId: {
                        cursoId: courseId,
                        alunoId: alunoId,
                    },
                },
            });
            if (!progressRecord) {
                progressRecord = yield prismaClient_1.default.progress.create({
                    data: {
                        alunoId,
                        cursoId: courseId,
                        courseProgress: 0,
                        completedLessons: JSON.stringify([]),
                    },
                });
            }
            return res.json(progressRecord);
        }
        // Get all students for the course
        const progressRecords = yield prismaClient_1.default.progress.findMany({
            where: { cursoId: courseId },
            include: {
                aluno: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
            },
        });
        res.json(progressRecords);
    }
    catch (error) {
        console.error("Error fetching progress for course:", error);
        res.status(500).json({ error: "Error fetching progress for course" });
    }
}));
// Nova rota POST para adicionar aluno ao curso
router.post("/:id/alunos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = Number(req.params.id);
        const { alunoId } = req.body;
        if (!alunoId) {
            return res.status(400).json({ error: "alunoId is required" });
        }
        if (isNaN(courseId) || isNaN(alunoId)) {
            return res.status(400).json({ error: "IDs inválidos" });
        }
        // Verifica se o curso existe
        const cursoExists = yield prismaClient_1.default.curso.findUnique({
            where: { id: courseId },
        });
        if (!cursoExists) {
            return res.status(404).json({ error: "Curso not found" });
        }
        // Buscar registro de progressão para o curso e aluno
        let progressRecord = yield prismaClient_1.default.progress.findUnique({
            where: {
                cursoId_alunoId: {
                    cursoId: courseId,
                    alunoId,
                },
            },
        });
        if (progressRecord) {
            return res.status(200).json(progressRecord);
        }
        // Criar novo registro de progresso para o aluno no curso
        progressRecord = yield prismaClient_1.default.progress.create({
            data: {
                alunoId,
                cursoId: courseId,
                courseProgress: 0,
                completedLessons: JSON.stringify([]),
            },
        });
        res.status(200).json(progressRecord);
    }
    catch (error) {
        console.error("Error adding aluno to course:", error);
        res.status(500).json({
            error: "Error adding aluno to course",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
router.put("/:id/alunos/:alunoId/progress", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoId = Number(req.params.id);
        const alunoId = Number(req.params.alunoId);
        const { courseProgress, completedLesson } = req.body;
        // Verificar se os IDs são válidos
        if (isNaN(cursoId) || isNaN(alunoId)) {
            return res.status(400).json({ error: "IDs inválidos" });
        }
        // Busca progresso atual
        const existing = yield prismaClient_1.default.progress.findUnique({
            where: { cursoId_alunoId: { alunoId, cursoId } },
        });
        // Recupera as aulas já concluídas ou inicia um array vazio
        let currentCompletedLessons = [];
        try {
            if (existing === null || existing === void 0 ? void 0 : existing.completedLessons) {
                // Handle the case where completedLessons might be empty or malformed
                const completedStr = String(existing.completedLessons);
                if (completedStr &&
                    completedStr !== '""' &&
                    completedStr !== "null") {
                    try {
                        currentCompletedLessons = JSON.parse(completedStr);
                        // Ensure it's an array
                        if (!Array.isArray(currentCompletedLessons)) {
                            currentCompletedLessons = [];
                        }
                    }
                    catch (innerError) {
                        console.error("Erro no parsing interno:", innerError);
                        currentCompletedLessons = [];
                    }
                }
            }
        }
        catch (parseError) {
            console.error("Erro ao analisar completedLessons:", parseError);
            currentCompletedLessons = [];
        }
        // Adiciona a nova aula concluída, se fornecida e ainda não estiver na lista
        if (completedLesson &&
            !currentCompletedLessons.includes(completedLesson)) {
            currentCompletedLessons.push(completedLesson);
        }
        // Soma o valor vindo do front ao progresso existente
        const existingProgress = (existing === null || existing === void 0 ? void 0 : existing.courseProgress) || 0;
        // Convert to integer (round to nearest whole number)
        const newProgressValue = Math.round(existingProgress + (courseProgress ? Math.round(courseProgress) : 0));
        const updated = yield prismaClient_1.default.progress.upsert({
            where: { cursoId_alunoId: { alunoId, cursoId } },
            update: {
                courseProgress: Math.min(newProgressValue, 100),
                completedLessons: JSON.stringify(currentCompletedLessons),
            },
            create: {
                alunoId,
                cursoId,
                courseProgress: Math.min(courseProgress ? Math.round(courseProgress) : 0, 100),
                completedLessons: JSON.stringify(completedLesson ? [completedLesson] : []),
            },
        });
        // Retorna as aulas concluídas na resposta
        const response = Object.assign(Object.assign({}, updated), { completedLessons: currentCompletedLessons });
        res.json(response);
    }
    catch (error) {
        console.error("Erro ao atualizar progresso:", error);
        res.status(500).json({
            error: "Erro ao atualizar progresso",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
router.get("/:id/alunos/:alunoId/progress", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoId = Number(req.params.id);
        const alunoId = Number(req.params.alunoId);
        // Verificar se os IDs são válidos
        if (isNaN(cursoId) || isNaN(alunoId)) {
            return res.status(400).json({ error: "IDs inválidos" });
        }
        const progress = yield prismaClient_1.default.progress.findUnique({
            where: { cursoId_alunoId: { alunoId, cursoId } },
        });
        if (progress) {
            // Processar o campo completedLessons com tratamento de erro
            let completedLessons = [];
            try {
                if (progress.completedLessons) {
                    // Handle the case where completedLessons might be empty or malformed
                    const completedStr = String(progress.completedLessons);
                    if (completedStr &&
                        completedStr !== '""' &&
                        completedStr !== "null") {
                        try {
                            completedLessons = JSON.parse(completedStr);
                            // Ensure it's an array
                            if (!Array.isArray(completedLessons)) {
                                completedLessons = [];
                            }
                        }
                        catch (innerError) {
                            console.error("Erro no parsing interno:", innerError);
                            completedLessons = [];
                        }
                    }
                }
            }
            catch (parseError) {
                console.error("Erro ao analisar completedLessons:", parseError);
                completedLessons = [];
            }
            // Retorna o progresso com as aulas concluídas como um array
            res.json(Object.assign(Object.assign({}, progress), { completedLessons }));
        }
        else {
            // Se não existir, criar um registro novo de progresso
            const newProgress = yield prismaClient_1.default.progress.create({
                data: {
                    alunoId,
                    cursoId,
                    courseProgress: 0,
                    completedLessons: JSON.stringify([]),
                },
            });
            res.json(Object.assign(Object.assign({}, newProgress), { completedLessons: [] }));
        }
    }
    catch (error) {
        console.error("Erro ao buscar progresso:", error);
        res.status(500).json({
            error: "Erro ao buscar progresso",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const curso = yield cursoService.update(Number(req.params.id), req.body);
        res.json(curso);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating curso" });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cursoService.delete(Number(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Error deactivating curso" });
    }
}));
// Route to reactivate a previously deactivated course
router.post("/:id/reactivate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const curso = yield cursoService.reactivate(Number(req.params.id));
        res.json(curso);
    }
    catch (error) {
        res.status(500).json({ error: "Error reactivating curso" });
    }
}));
router.put("/:cursoId/modulos/:moduloId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moduloId = Number(req.params.moduloId);
        const updatedModule = yield prismaClient_1.default.modulo.update({
            where: { id: moduloId },
            data: {
                nome: req.body.nome,
            },
        });
        res.json(updatedModule);
    }
    catch (error) {
        console.error("Error updating module:", error);
        res.status(500).json({ error: "Error updating module" });
    }
}));
router.put("/:cursoId/aulas/:aulaId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aulaId = Number(req.params.aulaId);
        const updatedAula = yield prismaClient_1.default.aula.update({
            where: { id: aulaId },
            data: {
                titulo: req.body.titulo,
                urlVideo: req.body.urlVideo,
            },
        });
        res.json(updatedAula);
    }
    catch (error) {
        console.error("Error updating aula:", error);
        res.status(500).json({ error: "Error updating aula" });
    }
}));
router.post("/:cursoId/modulos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoId = parseInt(req.params.cursoId, 10);
        const newModule = yield prismaClient_1.default.modulo.create({
            data: {
                nome: req.body.nome,
                cursoId: cursoId,
            },
        });
        res.status(201).json(newModule);
    }
    catch (error) {
        console.error("Error creating module:", error);
        res.status(500).json({ error: "Error creating module" });
    }
}));
// Add new route for creating lessons with video upload (MODIFICADO)
router.post("/:cursoId/modulos/:moduloId/aulas", upload.single("videoFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moduloId = parseInt(req.params.moduloId);
        const { titulo } = req.body;
        let urlVideo = "";
        // Se houver um arquivo, faz o upload para o Google Drive
        if (req.file) {
            try {
                urlVideo = yield aulaService.uploadVideo(req.file);
            }
            catch (uploadError) {
                console.error("Erro no upload para o Google Drive:", uploadError);
                return res.status(500).json({
                    error: "Erro ao fazer upload do vídeo para o Google Drive",
                });
            }
        }
        const newAula = yield prismaClient_1.default.aula.create({
            data: {
                titulo,
                urlVideo,
                moduloId,
            },
        });
        res.status(201).json(newAula);
    }
    catch (error) {
        console.error("Error creating aula:", error);
        res.status(500).json({ error: "Error creating aula" });
    }
}));
// Add new route for updating lesson video (MODIFICADO)
router.put("/aulas/:id/video", upload.single("video"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessonId = parseInt(req.params.id);
        if (!req.file) {
            return res.status(400).json({ error: "No video file provided" });
        }
        // Faz o upload do vídeo para o Google Drive e atualiza a aula
        const googleDriveUrl = yield aulaService.uploadVideo(req.file, lessonId);
        res.json({
            success: true,
            urlVideo: googleDriveUrl,
        });
    }
    catch (error) {
        console.error("Error updating lesson video:", error);
        res.status(500).json({ error: "Error updating lesson video" });
    }
}));
exports.default = router;
