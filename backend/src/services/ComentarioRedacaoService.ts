import { ComentarioRedacao } from "@prisma/client";
import prisma from "../utils/prismaClient";

export class ComentarioRedacaoService {
  async create(
    data: Omit<ComentarioRedacao, "id" | "created_at">
  ): Promise<ComentarioRedacao> {
    return prisma.comentarioRedacao.create({ data });
  }

  async findByResposta(respostaId: number): Promise<ComentarioRedacao[]> {
    return prisma.comentarioRedacao.findMany({
      where: { id_resposta: respostaId },
      include: {
        tipo_comentario: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
      },
      orderBy: {
        posicao_inicio: "asc",
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.comentarioRedacao.delete({ where: { id } });
  }
}
