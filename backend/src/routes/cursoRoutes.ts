import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { AulaService } from "../services/AulaService";
import { CursoService } from "../services/CursoService";
import prisma from "../utils/prismaClient";

const router = express.Router();
const cursoService = new CursoService();
const aulaService = new AulaService();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Update storage configuration para armazenar temporariamente os arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "temp");
    // Create directory if it doesn't exist
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

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB in bytes
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only MP4 files are allowed"));
    }
  },
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const curso = await cursoService.create(req.body);
    res.status(201).json(curso);
  } catch (error) {
    console.error("Error creating curso:", error);
    res.status(500).json({ error: "Error creating curso" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const professorId = req.query.professorId
      ? Number(req.query.professorId)
      : undefined;
    const cursos = professorId
      ? await cursoService.findByProfessorId(professorId)
      : await cursoService.findAll();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cursos" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const curso = await cursoService.findById(Number(req.params.id));
    if (curso) {
      res.json(curso);
    } else {
      res.status(404).json({ error: "Curso not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching curso" });
  }
});

router.get("/:id/alunos", async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const alunoId = req.query.alunoId ? Number(req.query.alunoId) : null;

    if (alunoId) {
      // Get specific student progress
      let progressRecord = await prisma.progress.findUnique({
        where: {
          cursoId_alunoId: {
            cursoId: courseId,
            alunoId: alunoId,
          },
        },
      });

      if (!progressRecord) {
        progressRecord = await prisma.progress.create({
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
    const progressRecords = await prisma.progress.findMany({
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
  } catch (error) {
    console.error("Error fetching progress for course:", error);
    res.status(500).json({ error: "Error fetching progress for course" });
  }
});

// Nova rota POST para adicionar aluno ao curso
router.post("/:id/alunos", async (req: Request, res: Response) => {
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
    const cursoExists = await prisma.curso.findUnique({
      where: { id: courseId },
    });

    if (!cursoExists) {
      return res.status(404).json({ error: "Curso not found" });
    }

    // Buscar registro de progressão para o curso e aluno
    let progressRecord = await prisma.progress.findUnique({
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
    progressRecord = await prisma.progress.create({
      data: {
        alunoId,
        cursoId: courseId,
        courseProgress: 0,
        completedLessons: JSON.stringify([]),
      },
    });

    res.status(200).json(progressRecord);
  } catch (error) {
    console.error("Error adding aluno to course:", error);
    res.status(500).json({
      error: "Error adding aluno to course",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

router.put(
  "/:id/alunos/:alunoId/progress",
  async (req: Request, res: Response) => {
    try {
      const cursoId = Number(req.params.id);
      const alunoId = Number(req.params.alunoId);
      const { courseProgress, completedLesson } = req.body;

      // Verificar se os IDs são válidos
      if (isNaN(cursoId) || isNaN(alunoId)) {
        return res.status(400).json({ error: "IDs inválidos" });
      }

      // Busca progresso atual
      const existing = await prisma.progress.findUnique({
        where: { cursoId_alunoId: { alunoId, cursoId } },
      });

      // Recupera as aulas já concluídas ou inicia um array vazio
      let currentCompletedLessons: number[] = [];
      try {
        if (existing?.completedLessons) {
          // Handle the case where completedLessons might be empty or malformed
          const completedStr = String(existing.completedLessons);
          if (
            completedStr &&
            completedStr !== '""' &&
            completedStr !== "null"
          ) {
            try {
              currentCompletedLessons = JSON.parse(completedStr);
              // Ensure it's an array
              if (!Array.isArray(currentCompletedLessons)) {
                currentCompletedLessons = [];
              }
            } catch (innerError) {
              console.error("Erro no parsing interno:", innerError);
              currentCompletedLessons = [];
            }
          }
        }
      } catch (parseError) {
        console.error("Erro ao analisar completedLessons:", parseError);
        currentCompletedLessons = [];
      }

      // Adiciona a nova aula concluída, se fornecida e ainda não estiver na lista
      if (
        completedLesson &&
        !currentCompletedLessons.includes(completedLesson)
      ) {
        currentCompletedLessons.push(completedLesson);
      }

      // Soma o valor vindo do front ao progresso existente
      const existingProgress = existing?.courseProgress || 0;
      // Convert to integer (round to nearest whole number)
      const newProgressValue = Math.round(
        existingProgress + (courseProgress ? Math.round(courseProgress) : 0)
      );

      const updated = await prisma.progress.upsert({
        where: { cursoId_alunoId: { alunoId, cursoId } },
        update: {
          courseProgress: Math.min(newProgressValue, 100),
          completedLessons: JSON.stringify(currentCompletedLessons),
        },
        create: {
          alunoId,
          cursoId,
          courseProgress: Math.min(
            courseProgress ? Math.round(courseProgress) : 0,
            100
          ),
          completedLessons: JSON.stringify(
            completedLesson ? [completedLesson] : []
          ),
        },
      });

      // Retorna as aulas concluídas na resposta
      const response = {
        ...updated,
        completedLessons: currentCompletedLessons,
      };

      res.json(response);
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      res.status(500).json({
        error: "Erro ao atualizar progresso",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
);

router.get(
  "/:id/alunos/:alunoId/progress",
  async (req: Request, res: Response) => {
    try {
      const cursoId = Number(req.params.id);
      const alunoId = Number(req.params.alunoId);

      // Verificar se os IDs são válidos
      if (isNaN(cursoId) || isNaN(alunoId)) {
        return res.status(400).json({ error: "IDs inválidos" });
      }

      const progress = await prisma.progress.findUnique({
        where: { cursoId_alunoId: { alunoId, cursoId } },
      });

      if (progress) {
        // Processar o campo completedLessons com tratamento de erro
        let completedLessons: number[] = [];
        try {
          if (progress.completedLessons) {
            // Handle the case where completedLessons might be empty or malformed
            const completedStr = String(progress.completedLessons);
            if (
              completedStr &&
              completedStr !== '""' &&
              completedStr !== "null"
            ) {
              try {
                completedLessons = JSON.parse(completedStr);
                // Ensure it's an array
                if (!Array.isArray(completedLessons)) {
                  completedLessons = [];
                }
              } catch (innerError) {
                console.error("Erro no parsing interno:", innerError);
                completedLessons = [];
              }
            }
          }
        } catch (parseError) {
          console.error("Erro ao analisar completedLessons:", parseError);
          completedLessons = [];
        }

        // Retorna o progresso com as aulas concluídas como um array
        res.json({
          ...progress,
          completedLessons,
        });
      } else {
        // Se não existir, criar um registro novo de progresso
        const newProgress = await prisma.progress.create({
          data: {
            alunoId,
            cursoId,
            courseProgress: 0,
            completedLessons: JSON.stringify([]),
          },
        });

        res.json({
          ...newProgress,
          completedLessons: [],
        });
      }
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
      res.status(500).json({
        error: "Erro ao buscar progresso",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
);

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const curso = await cursoService.update(Number(req.params.id), req.body);
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: "Error updating curso" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await cursoService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deactivating curso" });
  }
});

// Route to reactivate a previously deactivated course
router.post("/:id/reactivate", async (req: Request, res: Response) => {
  try {
    const curso = await cursoService.reactivate(Number(req.params.id));
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: "Error reactivating curso" });
  }
});

router.put(
  "/:cursoId/modulos/:moduloId",
  async (req: Request, res: Response) => {
    try {
      const moduloId = Number(req.params.moduloId);
      const updatedModule = await prisma.modulo.update({
        where: { id: moduloId },
        data: {
          nome: req.body.nome,
        },
      });
      res.json(updatedModule);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({ error: "Error updating module" });
    }
  }
);

router.put("/:cursoId/aulas/:aulaId", async (req: Request, res: Response) => {
  try {
    const aulaId = Number(req.params.aulaId);
    const updatedAula = await prisma.aula.update({
      where: { id: aulaId },
      data: {
        titulo: req.body.titulo,
        urlVideo: req.body.urlVideo,
      },
    });
    res.json(updatedAula);
  } catch (error) {
    console.error("Error updating aula:", error);
    res.status(500).json({ error: "Error updating aula" });
  }
});

router.post("/:cursoId/modulos", async (req: Request, res: Response) => {
  try {
    const cursoId = parseInt(req.params.cursoId, 10);
    const newModule = await prisma.modulo.create({
      data: {
        nome: req.body.nome,
        cursoId: cursoId,
      },
    });
    res.status(201).json(newModule);
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ error: "Error creating module" });
  }
});

// Add new route for creating lessons with video upload (MODIFICADO)
router.post(
  "/:cursoId/modulos/:moduloId/aulas",
  upload.single("videoFile"),
  async (req: MulterRequest, res: Response) => {
    try {
      const moduloId = parseInt(req.params.moduloId);
      const { titulo } = req.body;

      let urlVideo = "";

      // Se houver um arquivo, faz o upload para o Google Drive
      if (req.file) {
        try {
          urlVideo = await aulaService.uploadVideo(req.file);
        } catch (uploadError) {
          console.error("Erro no upload para o Google Drive:", uploadError);
          return res.status(500).json({
            error: "Erro ao fazer upload do vídeo para o Google Drive",
          });
        }
      }

      const newAula = await prisma.aula.create({
        data: {
          titulo,
          urlVideo,
          moduloId,
        },
      });

      res.status(201).json(newAula);
    } catch (error) {
      console.error("Error creating aula:", error);
      res.status(500).json({ error: "Error creating aula" });
    }
  }
);

// Add new route for updating lesson video (MODIFICADO)
router.put(
  "/aulas/:id/video",
  upload.single("video"),
  async (req: MulterRequest, res: Response) => {
    try {
      const lessonId = parseInt(req.params.id);

      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      // Faz o upload do vídeo para o Google Drive e atualiza a aula
      const googleDriveUrl = await aulaService.uploadVideo(req.file, lessonId);

      res.json({
        success: true,
        urlVideo: googleDriveUrl,
      });
    } catch (error) {
      console.error("Error updating lesson video:", error);
      res.status(500).json({ error: "Error updating lesson video" });
    }
  }
);

export default router;
