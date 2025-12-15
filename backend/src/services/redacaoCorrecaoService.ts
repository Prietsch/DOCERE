import { RedacaoCorrecao } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

interface CreateRedacaoCorrecaoData {
  id_redacao: number;
  id_redacao_resposta: number;
  descricao: string;
  id_professor: number;
}

export class RedacaoCorrecaoService implements CrudInterface<RedacaoCorrecao> {
  async create(data: CreateRedacaoCorrecaoData): Promise<RedacaoCorrecao> {
    try {
      console.log("Creating RedacaoCorrecao with data:", data);
      const createData = {
        id_redacao: Number(data.id_redacao),
        id_redacao_resposta: Number(data.id_redacao_resposta),
        descricao: String(data.descricao),
        id_professor: Number(data.id_professor),
      };

      const correcao = await prisma.redacaoCorrecao.create({
        data: createData,
        include: {
          redacao: true,
          resposta: true,
          professor: true,
        },
      });

      console.log("RedacaoCorrecao created successfully:", correcao);
      return correcao;
    } catch (error) {
      console.error("Error creating RedacaoCorrecao:", error);
      throw error;
    }
  }

  async findAll(): Promise<RedacaoCorrecao[]> {
    return prisma.redacaoCorrecao.findMany({
      include: {
        redacao: true,
        resposta: true,
        professor: true,
      },
    });
  }

  async findById(id: number): Promise<RedacaoCorrecao | null> {
    return prisma.redacaoCorrecao.findUnique({
      where: { id_redacao: id },
      include: {
        redacao: true,
        resposta: true,
        professor: true,
      },
    });
  }

  async update(
    id: number,
    data: Partial<RedacaoCorrecao>
  ): Promise<RedacaoCorrecao> {
    return prisma.redacaoCorrecao.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.redacaoCorrecao.delete({ where: { id } });
  }
}
