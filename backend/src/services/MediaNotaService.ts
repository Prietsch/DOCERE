import { MediaNota } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class MediaNotaService implements CrudInterface<MediaNota> {
  async create(data: Omit<MediaNota, "id">): Promise<MediaNota> {
    return prisma.mediaNota.create({ data });
  }

  async findAll(): Promise<MediaNota[]> {
    return prisma.mediaNota.findMany();
  }

  async findById(id: number): Promise<MediaNota | null> {
    return prisma.mediaNota.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<MediaNota>): Promise<MediaNota> {
    return prisma.mediaNota.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.mediaNota.delete({ where: { id } });
  }
}
