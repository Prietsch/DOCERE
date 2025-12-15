
// import { PrismaClient, User } from '@prisma/client';
// import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// export class UserService {
//     async create(data: Omit<User, 'id'>): Promise<User> {
//         // Verificar se o email já existe
//         const existingUser = await prisma.user.findUnique({
//             where: { email: data.email }
//         });
//         if (existingUser) {
//             throw new Error('Email already exists');
//         }

//         // Criptografar senha
//         const hashedPassword = await bcrypt.hash(data.senha, 10);

//         // Criar usuário
//         return prisma.user.create({
//             data: {
//                 ...data,
//                 senha: hashedPassword
//             }
//         });
//     }

//     async findAll(): Promise<User[]> {
//         return prisma.user.findMany();
//     }

//     async findById(id: number): Promise<User | null> {
//         return prisma.user.findUnique({ where: { id } });
//     }

//     async update(id: number, data: Partial<User>): Promise<User> {
//         return prisma.user.update({ where: { id }, data });
//     }

//     async delete(id: number): Promise<void> {
//         await prisma.user.delete({ where: { id } });
//     }
// }