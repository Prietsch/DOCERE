import express from "express";
import { RedacaoCorrecaoService } from "../services/redacaoCorrecaoService";

const router = express.Router();
const correcaoService = new RedacaoCorrecaoService();

// GET all redacao correcaos
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const correcoes = await correcaoService.findAll();
    res.json(correcoes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET a redacao correcao by id
router.get(
  "/:id_redacao",
  async (req: express.Request, res: express.Response) => {
    try {
      const correcao = await correcaoService.findById(
        Number(req.params.id_redacao)
      );
      if (correcao) {
        res.json(correcao);
      } else {
        res.status(404).json({ error: "Redação correção not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// CREATE a new redacao correcao
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const data = {
      id_redacao: req.body.id_redacao,
      id_redacao_resposta: req.body.id_redacao_resposta,
      descricao: req.body.descricao,
      id_professor: req.body.id_professor,
    };
    const newCorrecao = await correcaoService.create(data);
    res.status(201).json(newCorrecao);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE a redacao correcao
router.put("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const data = {
      descricao: req.body.descricao,
    };
    const updatedCorrecao = await correcaoService.update(
      Number(req.params.id),
      data
    );
    res.json(updatedCorrecao);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a redacao correcao
router.delete("/:id", async (req: express.Request, res: express.Response) => {
  try {
    await correcaoService.delete(Number(req.params.id));
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
