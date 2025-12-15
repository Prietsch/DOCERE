import { Curso } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class CursoService implements CrudInterface<Curso> {
  async create(data: Omit<Curso, "id">): Promise<Curso> {
    return prisma.curso.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        professorId: data.professorId,
        active: true,
      },
    });
  }

  async findAll(): Promise<Curso[]> {
    return prisma.curso.findMany({
      where: {
        active: true,
      },
      include: {
        modulos: {
          include: {
            aulas: true,
          },
        },
        professor: {
          select: {
            nome: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Curso | null> {
    return prisma.curso.findFirst({
      where: {
        id,
        active: true,
      },
      include: {
        modulos: {
          include: {
            aulas: true,
          },
        },
        professor: {
          select: {
            nome: true,
            email: true,
          },
        },
        // Inclusão dos alunos por meio dos registros de progressão
        progress: {
          include: {
            aluno: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, data: Partial<Curso>): Promise<Curso> {
    return prisma.curso.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`Iniciando soft delete do curso ID: ${id}`);

      // Verificar se o curso existe
      const curso = await prisma.curso.findUnique({
        where: { id },
      });

      if (!curso) {
        throw new Error(`Curso com ID: ${id} não encontrado`);
      }

      // Agora apenas atualizamos o campo active para false em vez de deletar fisicamente
      await prisma.curso.update({
        where: { id },
        data: { active: false },
      });

      console.log(`Curso ID: ${id} marcado como inativo com sucesso!`);
    } catch (error) {
      console.error("Erro ao desativar curso:", error);
      throw new Error(
        `Não foi possível desativar o curso ID: ${id}. Erro: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Método para reativar um curso que foi desativado
  async reactivate(id: number): Promise<Curso> {
    try {
      console.log(`Reativando curso ID: ${id}`);

      const updatedCurso = await prisma.curso.update({
        where: { id },
        data: { active: true },
      });

      console.log(`Curso ID: ${id} reativado com sucesso!`);
      return updatedCurso;
    } catch (error) {
      console.error("Erro ao reativar curso:", error);
      throw new Error(
        `Não foi possível reativar o curso ID: ${id}. Erro: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async createWithModules(data: any): Promise<Curso> {
    const { title, description, modules } = data;

    return prisma.curso.create({
      data: {
        nome: title,
        descricao: description,
        professor: data.professor, // Add the professor property
        active: true,
        modulos: {
          create: modules.map((module: any) => ({
            titulo: module.title,
            aulas: {
              create: module.lessons.map((lesson: any) => ({
                titulo: lesson.title,
                url_video: lesson.videoUrl,
              })),
            },
          })),
        },
      },
      include: {
        modulos: {
          include: {
            aulas: true,
          },
        },
      },
    });
  }

  async findByProfessorId(professorId: number): Promise<Curso[]> {
    return prisma.curso.findMany({
      where: {
        professorId,
        active: true,
      },
      include: {
        modulos: {
          include: {
            aulas: true,
          },
        },
        professor: {
          select: {
            nome: true,
          },
        },
      },
    });
  }
}
