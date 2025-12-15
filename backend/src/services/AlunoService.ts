import { Aluno } from "@prisma/client";
import bcrypt from "bcrypt";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class AlunoService implements CrudInterface<Aluno> {
  async create(data: Omit<Aluno, "id">): Promise<Aluno> {
    const existingAluno = await prisma.aluno.findUnique({
      where: { email: data.email },
    });

    if (existingAluno) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    return prisma.aluno.create({
      data: {
        ...data,
        senha: hashedPassword,
      },
    });
  }

  async findAll(): Promise<Aluno[]> {
    return prisma.aluno.findMany();
  }

  async findById(id: number): Promise<Aluno | null> {
    return prisma.aluno.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Aluno>): Promise<Aluno> {
    return prisma.aluno.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.aluno.delete({ where: { id } });
  }
}
