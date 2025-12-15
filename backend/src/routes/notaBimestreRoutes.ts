import express, { Request, Response } from 'express';
import { NotaBimestreService } from '../services/NotaBimestreService';

const router = express.Router();
const notaBimestreService = new NotaBimestreService();

router.post('/', async (req: Request, res: Response) => {
  try {
    const notaBimestre = await notaBimestreService.create(req.body);
    res.status(201).json(notaBimestre);
  } catch (error) {
    res.status(500).json({ error: 'Error creating nota bimestre' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const notasBimestre = await notaBimestreService.findAll();
    res.json(notasBimestre);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notas bimestre' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const notaBimestre = await notaBimestreService.findById(Number(req.params.id));
    if (notaBimestre) {
      res.json(notaBimestre);
    } else {
      res.status(404).json({ error: 'Nota bimestre not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching nota bimestre' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const notaBimestre = await notaBimestreService.update(Number(req.params.id), req.body);
    res.json(notaBimestre);
  } catch (error) {
    res.status(500).json({ error: 'Error updating nota bimestre' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await notaBimestreService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting nota bimestre' });
  }
});

export default router;

