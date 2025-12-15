import express from "express";
import { RedacaoService } from "../services/redacaoService";
import prisma from "../utils/prismaClient";

const router = express.Router();
const redacaoService = new RedacaoService();

// GET all redacaos
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const redacoes = await redacaoService.findAll();
    res.json(redacoes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET a redacao by id
router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const redacao = await redacaoService.findById(Number(req.params.id));
    if (redacao) {
      res.json(redacao);
    } else {
      res.status(404).json({ error: "Redação not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET redacao by aula id
router.get("/aula/:id", async (req: express.Request, res: express.Response) => {
  try {
    const aulaId = Number(req.params.id);
    const redacoes = await redacaoService.findByAulaId(aulaId);
    // Sempre retorne os resultados, mesmo que seja um array vazio
    res.json(redacoes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET redacoes disponíveis para um aluno
router.get(
  "/aluno/:id",
  async (req: express.Request, res: express.Response) => {
    try {
      const alunoId = Number(req.params.id);

      // Validar o ID do aluno
      if (!alunoId || isNaN(alunoId)) {
        return res.status(400).json({ error: "ID do aluno inválido" });
      } // Buscar todas as redações que o aluno tem acesso (através dos cursos em que está matriculado)
      const redacoesAluno = await prisma.redacao.findMany({
        where: {
          curso: {
            alunos: {
              some: {
                id: alunoId,
              },
            },
          },
        },
        include: {
          curso: {
            select: {
              id: true,
              nome: true,
            },
          },
          professor: {
            select: {
              id: true,
              nome: true,
            },
          },
          aula: {
            select: {
              id: true,
              titulo: true,
              moduloId: true,
            },
          },
          respostas: {
            where: {
              id_aluno: alunoId,
            },
            select: {
              id: true,
              text: true,
              correcao: {
                select: {
                  id: true,
                  descricao: true,
                },
              },
            },
          },
        },
      });

      res.json(redacoesAluno);
    } catch (error) {
      console.error("Erro ao buscar redações do aluno:", error);
      res.status(500).json({
        error: "Erro ao buscar redações do aluno",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
);

// GET redacoes respondidas por alunos em cursos de um professor
router.get(
  "/professor/:id/respostas",
  async (req: express.Request, res: express.Response) => {
    try {
      const professorId = Number(req.params.id);

      // Validar o ID do professor
      if (!professorId || isNaN(professorId)) {
        return res.status(400).json({ error: "ID do professor inválido" });
      }

      // Verificar se o professor existe
      const professor = await prisma.professor.findUnique({
        where: { id: professorId },
      });

      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }

      // Buscar todas as redações respondidas por alunos matriculados nos cursos do professor
      const redacoesRespondidas = await prisma.redacaoResposta.findMany({
        where: {
          redacao: {
            id_professor: professorId,
          },
        },
        include: {
          aluno: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          redacao: {
            include: {
              curso: {
                select: {
                  id: true,
                  nome: true,
                },
              },
              aula: {
                select: {
                  id: true,
                  titulo: true,
                  modulo: {
                    select: {
                      id: true,
                      nome: true,
                    },
                  },
                },
              },
            },
          },
          correcao: {
            select: {
              id: true,
              descricao: true,
            },
          },
        },
        orderBy: [{ redacao: { curso: { nome: "asc" } } }],
      });

      return res.status(200).json(redacoesRespondidas);
    } catch (error) {
      console.error("Erro ao buscar redações respondidas:", error);
      return res.status(500).json({
        error: "Erro ao buscar redações respondidas por alunos",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
);

// GET redacoes respondidas por alunos matriculados em um curso específico de um professor
router.get(
  "/professor/:professorId/curso/:cursoId/respostas",
  async (req: express.Request, res: express.Response) => {
    try {
      const professorId = Number(req.params.professorId);
      const cursoId = Number(req.params.cursoId);

      // Validar os IDs
      if (!professorId || isNaN(professorId)) {
        return res.status(400).json({ error: "ID do professor inválido" });
      }

      if (!cursoId || isNaN(cursoId)) {
        return res.status(400).json({ error: "ID do curso inválido" });
      }

      // Verificar se o professor existe
      const professor = await prisma.professor.findUnique({
        where: { id: professorId },
      });

      if (!professor) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }

      // Verificar se o curso existe e pertence ao professor
      const curso = await prisma.curso.findFirst({
        where: {
          id: cursoId,
          professorId: professorId,
        },
      });

      if (!curso) {
        return res.status(404).json({
          error: "Curso não encontrado ou não pertence ao professor informado",
        });
      }

      // Buscar todas as redações respondidas por alunos matriculados no curso específico do professor
      const redacoesRespondidas = await prisma.redacaoResposta.findMany({
        where: {
          redacao: {
            id_curso: cursoId,
            id_professor: professorId,
          },
        },
        include: {
          aluno: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          redacao: {
            include: {
              curso: {
                select: {
                  id: true,
                  nome: true,
                },
              },
              aula: {
                select: {
                  id: true,
                  titulo: true,
                  modulo: {
                    select: {
                      id: true,
                      nome: true,
                    },
                  },
                },
              },
            },
          },
          correcao: {
            select: {
              id: true,
              descricao: true,
            },
          },
        },
        orderBy: [{ redacao: { aula: { titulo: "asc" } } }],
      });

      return res.status(200).json(redacoesRespondidas);
    } catch (error) {
      console.error("Erro ao buscar redações respondidas do curso:", error);
      return res.status(500).json({
        error: "Erro ao buscar redações respondidas por alunos do curso",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
);

// CREATE a new redacao
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const { tema, descricao, id_curso, id_professor, id_aula } = req.body;

    // Validate required fields
    if (!tema || !id_curso || !id_professor || !id_aula) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["tema", "id_curso", "id_professor", "id_aula"],
        received: req.body,
      });
    }

    console.log("Creating redacao with data:", req.body);

    const newRedacao = await redacaoService.create({
      tema,
      descricao,
      id_curso: Number(id_curso),
      id_professor: Number(id_professor),
      id_aula: Number(id_aula),
    });

    console.log("Redacao created:", newRedacao);
    res.status(201).json(newRedacao);
  } catch (error) {
    console.error("Detailed error creating redacao:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// UPDATE a redacao
router.put("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const data = req.body;
    const updatedRedacao = await redacaoService.update(
      Number(req.params.id),
      data
    );
    res.json(updatedRedacao);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a redacao
router.delete("/:id", async (req: express.Request, res: express.Response) => {
  try {
    await redacaoService.delete(Number(req.params.id));
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
