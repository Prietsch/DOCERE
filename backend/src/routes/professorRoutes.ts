import express from 'express';
import { ProfessorService } from '../services/ProfessorService';

const router = express.Router();
const professorService = new ProfessorService();

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const professor = await professorService.create(req.body);
    res.status(201).json(professor);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already exists') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Error creating professor' });
    }
  }
});

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const professors = await professorService.findAll();
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching professors' });
  }
});

router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const professor = await professorService.findById(Number(req.params.id));
    if (professor) {
      res.json(professor);
    } else {
      res.status(404).json({ error: 'Professor not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching professor' });
  }
});

router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const professor = await professorService.update(Number(req.params.id), req.body);
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Error updating professor' });
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    await professorService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting professor' });
  }
});

export default router;

