import express, { Request, Response, Router } from "express";
import { ModuloService } from "../services/ModuloService";

const router: Router = express.Router();
const moduloService = new ModuloService();

router.post("/", async (req: Request, res: Response) => {
  try {
    const modulo = await moduloService.create(req.body);
    res.status(201).json(modulo);
  } catch (error) {
    res.status(500).json({ error: "Error creating modulo" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const modulos = await moduloService.findAll();
    res.json(modulos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching modulos" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const modulo = await moduloService.findById(Number(req.params.id));
    if (modulo) {
      res.json(modulo);
    } else {
      res.status(404).json({ error: "Modulo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching modulo" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const modulo = await moduloService.update(Number(req.params.id), req.body);
    res.json(modulo);
  } catch (error) {
    res.status(500).json({ error: "Error updating modulo" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await moduloService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({
      error: "Error deleting modulo",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
