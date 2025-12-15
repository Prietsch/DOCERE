import express, { Request, Response } from 'express';
import { AlunoService } from '../services/AlunoService';

const router = express.Router();
const alunoService = new AlunoService();

router.post('/', async (req: Request, res: Response) => {
  try {
    const aluno = await alunoService.create(req.body);
    res.status(201).json(aluno);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already exists') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error('Error creating aluno:', error);
      res.status(500).json({ error: 'Error creating aluno' });
    }
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const alunos = await alunoService.findAll();
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching alunos' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const aluno = await alunoService.findById(Number(req.params.id));
    if (aluno) {
      res.json(aluno);
    } else {
      res.status(404).json({ error: 'Aluno not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching aluno' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const aluno = await alunoService.update(Number(req.params.id), req.body);
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: 'Error updating aluno' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await alunoService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting aluno' });
  }
});

export default router;

