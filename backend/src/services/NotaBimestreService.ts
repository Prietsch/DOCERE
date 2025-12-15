import { NotaBimestre } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class NotaBimestreService implements CrudInterface<NotaBimestre> {
  async create(data: Omit<NotaBimestre, "id">): Promise<NotaBimestre> {
    return prisma.notaBimestre.create({ data });
  }

  async findAll(): Promise<NotaBimestre[]> {
    return prisma.notaBimestre.findMany();
  }

  async findById(id: number): Promise<NotaBimestre | null> {
    return prisma.notaBimestre.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<NotaBimestre>): Promise<NotaBimestre> {
    return prisma.notaBimestre.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.notaBimestre.delete({ where: { id } });
  }
}
