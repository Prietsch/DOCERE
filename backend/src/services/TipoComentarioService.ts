import { TipoComentario } from "@prisma/client";
import prisma from "../utils/prismaClient";

export class TipoComentarioService {
  async create(data: Omit<TipoComentario, "id">): Promise<TipoComentario> {
    return prisma.tipoComentario.create({ data });
  }

  async findByProfessor(professorId: number): Promise<TipoComentario[]> {
    return prisma.tipoComentario.findMany({
      where: { id_professor: professorId },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.tipoComentario.delete({ where: { id } });
  }
}
