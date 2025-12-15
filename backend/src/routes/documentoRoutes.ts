import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { DocumentoService } from "../services/DocumentoService";

const router = express.Router();
const documentoService = new DocumentoService();

// Configuração do multer para armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads/documentos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_"); // Sanitize filename
    const ext = path.extname(originalName);
    cb(null, `${path.basename(originalName, ext)}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
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
    } else {
      cb(new Error("Tipo de arquivo não permitido"));
    }
  },
});

interface DocumentRequest extends Request {
  file?: Express.Multer.File;
}

// Rota para fazer upload de um documento
router.post(
  "/",
  upload.single("documento"),
  async (req: DocumentRequest, res: Response) => {
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

      console.log(
        `Processando upload de documento: ${req.file.originalname} para a aula ${aulaId}`
      );

      // Opção 1: Usar o método uploadDocumento se você quiser fazer upload para o Google Drive
      const documento = await documentoService.uploadDocumento(
        req.file,
        titulo,
        parseInt(aulaId)
      );

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
    } catch (error: any) {
      console.error("Erro ao processar upload de documento:", error);

      // Limpar arquivo se existir
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
          console.log(`Arquivo temporário excluído: ${req.file.path}`);
        } catch (e) {
          console.error("Falha ao excluir arquivo temporário:", e);
        }
      }

      return res.status(500).json({
        error: "Erro ao fazer upload do documento",
        details: error.message,
      });
    }
  }
);

// Rota para obter documentos por ID da aula
router.get("/aula/:aulaId", async (req: Request, res: Response) => {
  try {
    const aulaId = parseInt(req.params.aulaId);
    const documentos = await documentoService.getDocumentosByAula(aulaId);
    return res.json(documentos);
  } catch (error: any) {
    console.error("Erro ao buscar documentos:", error);
    return res.status(500).json({
      error: "Erro ao buscar documentos",
      details: error.message,
    });
  }
});

// Rota para excluir documento
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await documentoService.deleteDocumento(id);
    return res.status(204).send();
  } catch (error: any) {
    console.error("Erro ao excluir documento:", error);
    return res.status(500).json({
      error: "Erro ao excluir documento",
      details: error.message,
    });
  }
});

export default router;
