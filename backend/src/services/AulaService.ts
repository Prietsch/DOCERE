import { Aula } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import { GoogleDriveService } from "../services/GoogleDriveService";
import prisma from "../utils/prismaClient";

const googleDriveService = new GoogleDriveService();
export class AulaService implements CrudInterface<Aula> {
  static findById(aulaId: number) {
    throw new Error("Method not implemented.");
  }
  async create(aulaData: {
    titulo: string;
    urlVideo: string;
    moduloId: number;
  }): Promise<Aula> {
    // Desestruturação dos dados recebidos
    const { titulo, urlVideo, moduloId } = aulaData;

    // Validar se todos os campos necessários estão presentes
    if (!titulo || !moduloId) {
      throw new Error("Campos obrigatórios não foram fornecidos.");
    }

    return prisma.aula.create({
      data: {
        titulo: titulo,
        urlVideo: urlVideo || "",
        moduloId: moduloId,
      },
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    aulaId?: number
  ): Promise<string> {
    try {
      // Upload do arquivo para o Google Drive
      const googleDriveUrl = await googleDriveService.uploadFile(file);

      // Se fornecido um ID de aula, atualiza o registro com a nova URL do vídeo
      if (aulaId) {
        // Busca a aula para verificar se já tem um vídeo associado
        const aula = await prisma.aula.findUnique({ where: { id: aulaId } });

        // Se já existir um vídeo, exclui do Google Drive antes de atualizar
        if (
          aula &&
          aula.urlVideo &&
          aula.urlVideo.includes("drive.google.com")
        ) {
          try {
            await googleDriveService.deleteFile(aula.urlVideo);
          } catch (error) {
            console.error("Erro ao excluir vídeo anterior:", error);
            // Continua o processo mesmo se falhar ao excluir o vídeo anterior
          }
        }

        // Atualiza a aula com a nova URL do vídeo
        await prisma.aula.update({
          where: { id: aulaId },
          data: { urlVideo: googleDriveUrl },
        });
      }

      return googleDriveUrl;
    } catch (error) {
      console.error("Erro no upload de vídeo:", error);
      throw new Error("Falha ao fazer upload do vídeo");
    }
  }

  async createWithActivity(data: {
    titulo: string;
    urlVideo?: string;
    moduloId: number;
  }): Promise<Aula> {
    const { titulo, urlVideo = "", moduloId } = data;

    const createdAula = await prisma.aula.create({
      data: {
        titulo,
        urlVideo,
        moduloId,
      },
    });

    return createdAula;
  }

  async findAll(): Promise<Aula[]> {
    return prisma.aula.findMany();
  }

  async findById(id: number): Promise<Aula | null> {
    return prisma.aula.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Aula>): Promise<Aula> {
    return prisma.aula.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    // Buscar a aula para obter o URL do vídeo
    const aula = await prisma.aula.findUnique({ where: { id } });

    // Excluir a aula do banco de dados
    await prisma.aula.delete({ where: { id } });

    // Se existir um vídeo associado e for do Google Drive, excluir do Drive também
    if (aula && aula.urlVideo && aula.urlVideo.includes("drive.google.com")) {
      try {
        await googleDriveService.deleteFile(aula.urlVideo);
      } catch (error) {
        console.error("Erro ao excluir vídeo do Google Drive:", error);
        // Não lança exceção para não interromper o processo se a exclusão do arquivo falhar
      }
    }
  }
}
