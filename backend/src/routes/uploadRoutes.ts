import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuração do multer para armazenamento dos arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Diretório onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
        // Renomeia o arquivo para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceitar apenas arquivos mp4
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado. Por favor, envie um arquivo mp4.'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/', upload.single('file'), (req: express.Request, res: express.Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        // Retornar a URL onde o arquivo pode ser acessado
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        res.status(200).json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
});

export default router;