import express, { Request, Response, Router } from 'express';
import { ChatService } from '../services/ChatService';

const router: Router = express.Router();
const chatService = new ChatService();

router.post('/', async (req: Request, res: Response) => {
  try {
    const chat = await chatService.create(req.body);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const chats = await chatService.findAll();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const chat = await chatService.findById(Number(req.params.id));
    if (chat) {
      res.json(chat);
    } else {
      res.status(404).json({ error: 'Chat not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const chat = await chatService.update(Number(req.params.id), req.body);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error updating chat' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await chatService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting chat' });
  }
});

export default router;

