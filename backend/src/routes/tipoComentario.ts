import express from 'express';
import { TipoComentarioService } from '../services/TipoComentarioService';

const router = express.Router();
const tipoComentarioService = new TipoComentarioService();

// GET tipos de comentário por professor
router.get('/professor/:id', async (req, res) => {
  try {
    const tipos = await tipoComentarioService.findByProfessor(Number(req.params.id));
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE novo tipo de comentário
router.post('/', async (req, res) => {
  try {
    const { nome, cor, id_professor } = req.body;
    const novoTipo = await tipoComentarioService.create({
      nome,
      cor,
      id_professor: Number(id_professor),
    });
    res.status(201).json(novoTipo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE tipo de comentário
router.delete('/:id', async (req, res) => {
  try {
    await tipoComentarioService.delete(Number(req.params.id));
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
