import bcrypt from "bcrypt";
import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prismaClient";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

router.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  try {
    // Primeiro tenta encontrar um professor
    let user = await prisma.professor.findUnique({ where: { email } });
    let role = "teacher";

    // Se não encontrar professor, tenta encontrar aluno
    if (!user) {
      user = await prisma.aluno.findUnique({ where: { email } });
      role = "student";
    }

    // Se não encontrar nenhum usuário
    if (!user) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    // Verifica se existe uma senha armazenada
    if (!user.senha) {
      console.error("Senha não encontrada para o usuário:", email);
      return res.status(500).json({ message: "Erro na autenticação" });
    }

    // Verifica a senha
    const validPassword = await bcrypt.compare(password, user.senha);
    if (!validPassword) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Remove a senha do objeto antes de enviar
    const { senha, ...userWithoutPassword } = user;

    // Retorna os dados do usuário com sua role e token
    res.json({
      ...userWithoutPassword,
      role,
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Middleware para verificar token
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido" });
      }
      req.user = decoded;
      next();
    }
  );
};

// Rota para verificar token
router.get(
  "/verify-token",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      let userData;

      if (user?.role === "teacher") {
        userData = await prisma.professor.findUnique({
          where: { id: user.id },
          select: { id: true, nome: true, email: true },
        });
      } else {
        userData = await prisma.aluno.findUnique({
          where: { id: user?.id },
          select: { id: true, nome: true, email: true },
        });
      }

      if (!userData) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({
        ...userData,
        role: user?.role,
      });
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

export default router;
