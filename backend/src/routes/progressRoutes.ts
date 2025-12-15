import express from "express";
import { verifyToken } from "../middleware/auth";
import prisma from "../utils/prismaClient";

const router = express.Router();

// Obter progresso do curso
router.get("/:cursoId", verifyToken, async (req: any, res) => {
  try {
    const cursoId = parseInt(req.params.cursoId);
    const alunoId = req.user.id;

    const progress = await prisma.progress.findUnique({
      where: {
        cursoId_alunoId: {
          cursoId,
          alunoId,
        },
      },
    });

    res.json(progress || { courseProgress: 0, completedLessons: [] });
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    res.status(500).json({ message: "Erro ao buscar progresso" });
  }
});

// Atualizar progresso de um curso
router.post("/:cursoId", verifyToken, async (req: any, res) => {
  try {
    const cursoId = parseInt(req.params.cursoId);
    const alunoId = req.user.id;
    const { courseProgress, completedLessons } = req.body;

    const progress = await prisma.progress.upsert({
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
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error);
    res.status(500).json({ message: "Erro ao atualizar progresso" });
  }
});

export default router;
