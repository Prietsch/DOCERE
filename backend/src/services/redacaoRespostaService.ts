import { RedacaoResposta } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class RedacaoRespostaService implements CrudInterface<RedacaoResposta> {
  async create(data: Omit<RedacaoResposta, "id">): Promise<RedacaoResposta> {
    return prisma.redacaoResposta.create({ data });
  }

  async findAll(): Promise<RedacaoResposta[]> {
    return prisma.redacaoResposta.findMany({
      include: {
        redacao: true,
        aluno: true,
        correcao: true,
      },
    });
  }

  async findById(id: number): Promise<RedacaoResposta | null> {
    return prisma.redacaoResposta.findUnique({
      where: { id },
      include: {
        redacao: true,
        aluno: true,
        correcao: true,
      },
    });
  }

  async findByAlunoAndRedacao(
    id_aluno: number,
    id_redacao: number
  ): Promise<RedacaoResposta[]> {
    return prisma.redacaoResposta.findMany({
      where: {
        id_aluno,
        id_redacao,
      },
      include: {
        redacao: true,
        aluno: true,
        correcao: true,
      },
    });
  }

  async findByAluno(alunoId: number): Promise<RedacaoResposta[]> {
    return prisma.redacaoResposta.findMany({
      where: {
        id_aluno: alunoId,
      },
      include: {
        redacao: {
          include: {
            curso: true,
            aula: true,
            professor: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        correcao: {
          include: {
            professor: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        comentarios: {
          include: {
            tipo_comentario: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Partial<RedacaoResposta>
  ): Promise<RedacaoResposta> {
    return prisma.redacaoResposta.update({
      where: { id },
      data,
      include: {
        redacao: true,
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        correcao: {
          include: {
            professor: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        comentarios: {
          include: {
            tipo_comentario: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.redacaoResposta.delete({ where: { id } });
  }

  async findByIdWithComments(id: number): Promise<RedacaoResposta | null> {
    return prisma.redacaoResposta.findUnique({
      where: { id },
      include: {
        redacao: true,
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        correcao: {
          include: {
            professor: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        comentarios: {
          include: {
            tipo_comentario: true,
          },
        },
      },
    });
  }

  async addComentario(data: {
    id_resposta: number;
    id_tipo_comentario: number;
    texto_comentario: string;
    posicao_inicio: number;
    posicao_fim: number;
  }) {
    return prisma.comentarioRedacao.create({
      data,
      include: {
        tipo_comentario: true,
      },
    });
  }
}
