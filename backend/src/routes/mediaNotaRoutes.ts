import express, { Request, Response } from 'express';
import { MediaNotaService } from '../services/MediaNotaService';

const router = express.Router();
const mediaNotaService = new MediaNotaService();

router.post('/', async (req: Request, res: Response) => {
  try {
    const mediaNota = await mediaNotaService.create(req.body);
    res.status(201).json(mediaNota);
  } catch (error) {
    res.status(500).json({ error: 'Error creating media nota' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const mediasNota = await mediaNotaService.findAll();
    res.json(mediasNota);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching medias nota' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const mediaNota = await mediaNotaService.findById(Number(req.params.id));
    if (mediaNota) {
      res.json(mediaNota);
    } else {
      res.status(404).json({ error: 'Media nota not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching media nota' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const mediaNota = await mediaNotaService.update(Number(req.params.id), req.body);
    res.json(mediaNota);
  } catch (error) {
    res.status(500).json({ error: 'Error updating media nota' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await mediaNotaService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting media nota' });
  }
});

export default router;

