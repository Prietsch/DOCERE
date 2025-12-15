import { Modulo } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class ModuloService implements CrudInterface<Modulo> {
  async create(data: Omit<Modulo, "id">): Promise<Modulo> {
    return prisma.modulo.create({
      data: {
        nome: data.nome,
        cursoId: data.cursoId,
      },
    });
  }

  async findAll(): Promise<Modulo[]> {
    return prisma.modulo.findMany();
  }

  async findById(id: number): Promise<Modulo | null> {
    return prisma.modulo.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Modulo>): Promise<Modulo> {
    return prisma.modulo.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    // First, find related aulas to delete
    const aulas = await prisma.aula.findMany({
      where: { moduloId: id },
      select: { id: true },
    });

    const aulaIds = aulas.map((aula) => aula.id);

    // Delete module and all related entities in a transaction
    await prisma.$transaction(async (tx) => {
      // Find questionarios related to aulas
      const questionarios = await tx.questionario.findMany({
        where: { aulaId: { in: aulaIds } },
        select: { id: true },
      });

      const questionarioIds = questionarios.map((q) => q.id);

      // Find perguntas related to questionarios
      const perguntas = await tx.pergunta.findMany({
        where: { questionarioId: { in: questionarioIds } },
        select: { id: true },
      });

      const perguntaIds = perguntas.map((p) => p.id);

      // Find redacoes related to aulas
      const redacoes = await tx.redacao.findMany({
        where: { id_aula: { in: aulaIds } },
        select: { id: true },
      });

      const redacaoIds = redacoes.map((r) => r.id);

      // Find redacao respostas related to redacoes
      const respostas = await tx.redacaoResposta.findMany({
        where: { id_redacao: { in: redacaoIds } },
        select: { id: true },
      });

      const respostaIds = respostas.map((r) => r.id);

      // Delete all related records in the correct order (from children to parents)

      // 1. Delete comentarios redacao
      if (respostaIds.length > 0) {
        await tx.comentarioRedacao.deleteMany({
          where: { id_resposta: { in: respostaIds } },
        });
      }

      // 2. Delete redacao correcoes
      if (redacaoIds.length > 0 || respostaIds.length > 0) {
        await tx.redacaoCorrecao.deleteMany({
          where: {
            OR: [
              { id_redacao: { in: redacaoIds } },
              { id_redacao_resposta: { in: respostaIds } },
            ],
          },
        });
      }

      // 3. Delete redacao respostas
      if (redacaoIds.length > 0) {
        await tx.redacaoResposta.deleteMany({
          where: { id_redacao: { in: redacaoIds } },
        });
      }

      // 4. Delete redacoes
      if (aulaIds.length > 0) {
        await tx.redacao.deleteMany({
          where: { id_aula: { in: aulaIds } },
        });
      }

      // 5. Delete resposta questionario
      if (perguntaIds.length > 0) {
        await tx.respostaQuestionario.deleteMany({
          where: { perguntaId: { in: perguntaIds } },
        });
      }

      // 6. Delete resposta correta
      if (perguntaIds.length > 0) {
        await tx.respostaCorreta.deleteMany({
          where: { perguntaId: { in: perguntaIds } },
        });
      }

      // 7. Delete pontuacao questionario
      if (questionarioIds.length > 0) {
        await tx.pontuacaoQuestionario.deleteMany({
          where: { questionarioId: { in: questionarioIds } },
        });
      }

      // 8. Delete perguntas
      if (questionarioIds.length > 0) {
        await tx.pergunta.deleteMany({
          where: { questionarioId: { in: questionarioIds } },
        });
      }

      // 9. Delete questionarios
      if (aulaIds.length > 0) {
        await tx.questionario.deleteMany({
          where: { aulaId: { in: aulaIds } },
        });
      }

      // 10. Delete documentos
      if (aulaIds.length > 0) {
        await tx.documento.deleteMany({
          where: { aulaId: { in: aulaIds } },
        });
      }

      // 11. Delete formularios
      if (aulaIds.length > 0) {
        await tx.formulario.deleteMany({
          where: { aulaId: { in: aulaIds } },
        });
      }

      // 12. Delete aulas
      await tx.aula.deleteMany({
        where: { moduloId: id },
      });

      // 13. Finally delete the modulo
      await tx.modulo.delete({
        where: { id },
      });
    });
  }
}
