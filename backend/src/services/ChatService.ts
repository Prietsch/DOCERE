import { Chat } from "@prisma/client";
import { CrudInterface } from "../interfaces/CrudInterface";
import prisma from "../utils/prismaClient";

export class ChatService implements CrudInterface<Chat> {
  async create(data: Omit<Chat, "id">): Promise<Chat> {
    return prisma.chat.create({ data });
  }

  async findAll(): Promise<Chat[]> {
    return prisma.chat.findMany();
  }

  async findById(id: number): Promise<Chat | null> {
    return prisma.chat.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Chat>): Promise<Chat> {
    return prisma.chat.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.chat.delete({ where: { id } });
  }
}
