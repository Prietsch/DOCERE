import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { AulaService } from "../services/AulaService";
import { GoogleDriveService } from "../services/GoogleDriveService";
import prisma from "../utils/prismaClient";

const router = express.Router();
const aulaService = new AulaService();
const googleDriveService = new GoogleDriveService();

// Configuração do multer para armazenamento temporário dos arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Otimizado para melhor gerenciamento de memória
const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // Reduzido para 250MB para melhor gestão de memória
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos MP4 são permitidos"));
    }
  },
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Middleware para lidar com erros do multer
const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "Tamanho de arquivo excedido",
        details: "O arquivo de vídeo não pode ser maior que 250MB",
      });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Middleware para limpar arquivos temporários em caso de erro
const cleanupOnError = (
  req: MulterRequest,
  res: Response,
  next: NextFunction
) => {
  const originalEnd = res.end;
  const originalJson = res.json;

  // Sobrescrever método end
  res.end = function (chunk?: any, ...args: any[]) {
    const statusCode = res.statusCode;
    if (statusCode >= 400 && req.file) {
      try {
        console.log(
          `Limpando arquivo temporário devido a erro: ${req.file.path}`
        );
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Erro ao limpar arquivo temporário:", err);
      }
    }
    return (originalEnd as any).apply(this, [chunk, ...args]);
  };

  // Sobrescrever método json
  res.json = function (body) {
    const statusCode = res.statusCode;
    if (statusCode >= 400 && req.file) {
      try {
        console.log(
          `Limpando arquivo temporário devido a erro: ${req.file.path}`
        );
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Erro ao limpar arquivo temporário:", err);
      }
    }
    return originalJson.call(this, body);
  };

  next();
};

// Rota para criar aula com upload de arquivo mp4
router.post(
  "/",
  cleanupOnError,
  upload.single("videoFile"),
  handleMulterError,
  async (req: MulterRequest, res: Response) => {
    try {
      console.log("Received request to create lesson:", req.body);
      const { titulo, moduloId } = req.body;

      // Validação básica dos campos obrigatórios
      if (!titulo || !moduloId) {
        return res.status(400).json({
          error: "Título e ID do módulo são obrigatórios",
        });
      }

      let urlVideo = "";

      // Se houver um arquivo, faz o upload para o Google Drive
      if (req.file) {
        try {
          console.log(
            `Iniciando upload do vídeo ${req.file.originalname} (${Math.round(
              req.file.size / 1024 / 1024
            )}MB) para o Google Drive`
          );
          urlVideo = await aulaService.uploadVideo(req.file);
          console.log(`Upload concluído com sucesso: ${urlVideo}`);
        } catch (uploadError: any) {
          console.error("Erro no upload para o Google Drive:", uploadError);
          return res.status(500).json({
            error: "Erro ao fazer upload do vídeo para o Google Drive",
            details: uploadError.message ?? "Erro desconhecido no upload",
          });
        }
      } else if (req.body.urlVideo) {
        // Se não há arquivo mas tem URL de vídeo (externo), usar essa URL
        console.log("Usando URL externa de vídeo:", req.body.urlVideo);
        urlVideo = req.body.urlVideo;
      }

      console.log("Criando aula com os dados:", {
        titulo,
        urlVideo,
        moduloId: parseInt(moduloId),
      });

      const novaAula = await aulaService.create({
        titulo,
        urlVideo,
        moduloId: parseInt(moduloId),
      });

      console.log("Aula criada com sucesso:", novaAula);
      return res.status(201).json(novaAula);
    } catch (error: any) {
      console.error("Erro ao criar aula:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        error: "Erro ao criar aula",
        details: errorMessage,
      });
    }
  }
);

router.post("/with-activity", upload.none(), async (req, res) => {
  try {
    const newAula = await aulaService.createWithActivity({
      titulo: req.body.titulo,
      urlVideo: req.body.urlVideo,
      moduloId: parseInt(req.body.moduloId),
    });
    res.status(201).json(newAula);
  } catch (error: unknown) {
    console.error("Erro ao criar aula com atividade:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({
      error: "Erro ao criar aula com atividade",
      details: errorMessage,
    });
  }
});

router.post(
  "/upload-preview",
  cleanupOnError,
  upload.single("videoFile"),
  handleMulterError,
  async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Nenhum arquivo de vídeo fornecido" });
      }

      console.log(
        `Iniciando upload de preview do vídeo ${
          req.file.originalname
        } (${Math.round(req.file.size / 1024 / 1024)}MB) para o Google Drive`
      );

      // Faz o upload do vídeo para o Google Drive sem associar a uma aula específica
      const googleDriveUrl = await aulaService.uploadVideo(req.file);
      console.log(`Upload de preview concluído com sucesso: ${googleDriveUrl}`);

      // Certifica-se de que a resposta seja enviada corretamente
      return res.status(200).json({
        success: true,
        urlVideo: googleDriveUrl,
      });
    } catch (error) {
      console.error("Erro ao fazer upload do vídeo:", error);
      // Ensure we're sending a proper error response
      return res.status(500).json({
        success: false,
        error: "Erro ao fazer upload do vídeo para o Google Drive",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      // Log para confirmar que a função chegou ao fim
      console.log("Processamento da rota upload-preview finalizado");
    }
  }
);

// Add video upload endpoint to an existing lesson
router.post(
  "/:id/video",
  cleanupOnError,
  upload.single("videoFile"),
  handleMulterError,
  async (req: MulterRequest, res: Response) => {
    try {
      const aulaId = parseInt(req.params.id);

      // Check if the aula exists
      const aula = await prisma.aula.findUnique({
        where: { id: aulaId },
      });

      if (!aula) {
        return res.status(404).json({ error: "Aula não encontrada" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Nenhum arquivo de vídeo foi enviado" });
      }

      console.log(`Processing video upload for lesson ${aulaId}`);

      // Usar o serviço AulaService para fazer upload do vídeo
      const videoUrl = await aulaService.uploadVideo(req.file, aulaId);

      // Buscar a aula atualizada
      const updatedAula = await prisma.aula.findUnique({
        where: { id: aulaId },
      });

      console.log(`Video URL updated for lesson ${aulaId}: ${videoUrl}`);
      return res.status(200).json(updatedAula);
    } catch (error: unknown) {
      console.error("Error updating lesson video:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        error: "Erro ao atualizar o vídeo da aula",
        details: errorMessage,
      });
    }
  }
);

// Restante das rotas permanece igual
router.get("/", async (req, res) => {
  try {
    const aulas = await aulaService.findAll();
    res.json(aulas);
  } catch (error: unknown) {
    console.error("Erro ao buscar aulas:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res
      .status(500)
      .json({ error: "Erro ao buscar aulas", details: errorMessage });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const aula = await aulaService.findById(Number(req.params.id));
    if (aula) {
      res.json(aula);
    } else {
      res.status(404).json({ error: "Aula não encontrada" });
    }
  } catch (error: unknown) {
    console.error("Erro ao buscar aula:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res
      .status(500)
      .json({ error: "Erro ao buscar aula", details: errorMessage });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const aula = await aulaService.update(Number(req.params.id), req.body);
    res.json(aula);
  } catch (error: unknown) {
    console.error("Erro ao atualizar aula:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res
      .status(500)
      .json({ error: "Erro ao atualizar aula", details: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await aulaService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error: unknown) {
    console.error("Erro ao excluir aula:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    res
      .status(500)
      .json({ error: "Erro ao excluir aula", details: errorMessage });
  }
});

export default router;
