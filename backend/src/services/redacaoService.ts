import { Prisma, Redacao } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class RedacaoService implements CrudInterface<Redacao> {
  async create(data: {
    tema: string;
    descricao?: string | null;
    id_curso: number;
    id_professor: number;
    id_aula: number;
  }): Promise<Redacao> {
    try {
      const createData: Prisma.RedacaoCreateInput = {
        tema: data.tema,
        descricao: data.descricao || null,
        curso: { connect: { id: data.id_curso } },
        professor: { connect: { id: data.id_professor } },
        aula: { connect: { id: data.id_aula } },
      };

      const redacao = await prisma.redacao.create({
        data: createData,
      });
      return redacao;
    } catch (error) {
      console.error("Error in RedacaoService.create:", error);
      throw error;
    }
  }

  async findAll(): Promise<Redacao[]> {
    return prisma.redacao.findMany({
      include: {
        curso: true,
        professor: true,
        aula: true,
        respostas: true,
        correcao: true,
      },
    });
  }

  async findById(id: number): Promise<Redacao | null> {
    return prisma.redacao.findUnique({
      where: { id },
      include: {
        curso: true,
        professor: true,
        aula: true,
        respostas: true,
        correcao: true,
      },
    });
  }

  async findByAulaId(aulaId: number): Promise<Redacao[]> {
    return prisma.redacao.findMany({
      where: { id_aula: aulaId },
      include: {
        curso: true,
        professor: true,
        aula: true,
        respostas: {
          include: {
            aluno: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        correcao: true,
      },
    });
  }

  async update(id: number, data: Partial<Redacao>): Promise<Redacao> {
    return prisma.redacao.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.redacao.delete({ where: { id } });
  }
}
