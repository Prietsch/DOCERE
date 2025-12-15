import express from "express";
import { ComentarioRedacaoService } from "../services/ComentarioRedacaoService";

const router = express.Router();
const comentarioService = new ComentarioRedacaoService();

// GET comentários por resposta
router.get("/resposta/:id", async (req, res) => {
  try {
    const comentarios = await comentarioService.findByResposta(
      Number(req.params.id)
    );
    if (!comentarios) {
      return res.status(404).json({ error: "No comments found" });
    }
    console.log("Comentários encontrados:", comentarios);
    res.json(comentarios);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// CREATE novo comentário
router.post("/", async (req, res) => {
  try {
    const {
      id_resposta,
      id_tipo_comentario,
      texto_comentario,
      posicao_inicio,
      posicao_fim,
    } = req.body;
    const novoComentario = await comentarioService.create({
      id_resposta: Number(id_resposta),
      id_tipo_comentario: Number(id_tipo_comentario),
      texto_comentario,
      posicao_inicio: Number(posicao_inicio),
      posicao_fim: Number(posicao_fim),
    });
    res.status(201).json(novoComentario);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE comentário
router.delete("/:id", async (req, res) => {
  try {
    await comentarioService.delete(Number(req.params.id));
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
