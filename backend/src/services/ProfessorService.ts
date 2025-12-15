import { Professor } from "@prisma/client";
import bcrypt from "bcrypt";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class ProfessorService implements CrudInterface<Professor> {
  async create(data: Omit<Professor, "id">): Promise<Professor> {
    const existingProfessor = await prisma.professor.findUnique({
      where: { email: data.email },
    });

    if (existingProfessor) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    return prisma.professor.create({
      data: {
        ...data,
        senha: hashedPassword,
      },
    });
  }

  async findAll(): Promise<Professor[]> {
    return prisma.professor.findMany();
  }

  async findById(id: number): Promise<Professor | null> {
    return prisma.professor.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Professor>): Promise<Professor> {
    return prisma.professor.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.professor.delete({ where: { id } });
  }
}
