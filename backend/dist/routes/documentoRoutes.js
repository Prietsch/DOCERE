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
const DocumentoService_1 = require("../services/DocumentoService");
const router = express_1.default.Router();
const documentoService = new DocumentoService_1.DocumentoService();
// Configuração do multer para armazenamento dos arquivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), "uploads/documentos");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_"); // Sanitize filename
        const ext = path_1.default.extname(originalName);
        cb(null, `${path_1.default.basename(originalName, ext)}-${uniqueSuffix}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB em bytes
    },
    fileFilter: (req, file, cb) => {
        // Tipos de arquivos permitidos
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Tipo de arquivo não permitido"));
        }
    },
});
// Rota para fazer upload de um documento
router.post("/", upload.single("documento"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Requisição de upload de documento recebida:", req.body);
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }
        const { titulo, aulaId } = req.body;
        if (!titulo || !aulaId) {
            return res
                .status(400)
                .json({ error: "Título e ID da aula são obrigatórios" });
        }
        console.log(`Processando upload de documento: ${req.file.originalname} para a aula ${aulaId}`);
        // Opção 1: Usar o método uploadDocumento se você quiser fazer upload para o Google Drive
        const documento = yield documentoService.uploadDocumento(req.file, titulo, parseInt(aulaId));
        /* Opção 2: Usar o método create se você quiser armazenar localmente
        const filePath = req.file.path;
        const documento = await documentoService.create({
          titulo,
          filePath,
          aulaId: parseInt(aulaId),
        });
        */
        console.log("Registro de documento criado no banco de dados:", documento);
        return res.status(201).json(documento);
    }
    catch (error) {
        console.error("Erro ao processar upload de documento:", error);
        // Limpar arquivo se existir
        if (req.file && req.file.path) {
            try {
                fs_1.default.unlinkSync(req.file.path);
                console.log(`Arquivo temporário excluído: ${req.file.path}`);
            }
            catch (e) {
                console.error("Falha ao excluir arquivo temporário:", e);
            }
        }
        return res.status(500).json({
            error: "Erro ao fazer upload do documento",
            details: error.message,
        });
    }
}));
// Rota para obter documentos por ID da aula
router.get("/aula/:aulaId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aulaId = parseInt(req.params.aulaId);
        const documentos = yield documentoService.getDocumentosByAula(aulaId);
        return res.json(documentos);
    }
    catch (error) {
        console.error("Erro ao buscar documentos:", error);
        return res.status(500).json({
            error: "Erro ao buscar documentos",
            details: error.message,
        });
    }
}));
// Rota para excluir documento
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield documentoService.deleteDocumento(id);
        return res.status(204).send();
    }
    catch (error) {
        console.error("Erro ao excluir documento:", error);
        return res.status(500).json({
            error: "Erro ao excluir documento",
            details: error.message,
        });
    }
}));
exports.default = router;
