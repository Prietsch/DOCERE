"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Configuração do multer para armazenamento dos arquivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Diretório onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
        // Renomeia o arquivo para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Filtro para aceitar apenas arquivos mp4
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de arquivo não suportado. Por favor, envie um arquivo mp4.'));
    }
};
const upload = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter });
router.post('/', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        // Retornar a URL onde o arquivo pode ser acessado
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
});
exports.default = router;
