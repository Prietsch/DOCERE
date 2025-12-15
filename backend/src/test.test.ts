// process.env.RENDER_URL = 'postgresql://render:6jwnS67h6zlVzJt9IemWNpqQHustB97n@dpg-cv3prbt2ng1s73d9tv0g-a:5433/dbcursos_8iub';
// import { PrismaClient } from '@prisma/client';
// import { execSync } from 'child_process';

// const prisma = new PrismaClient();

// beforeAll(async () => {
//   // Resetar o banco de dados de teste
//   execSync('npx prisma migrate reset --force');
// });

// afterAll(async () => {
//   await prisma.$disconnect();
// });

// beforeEach(async () => {
//   // Clear the database before each test
//   const tablenames = await prisma.$queryRaw<
//     Array<{ tablename: string }>
//   >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

//   for (const { tablename } of tablenames) {
//     if (tablename !== '_prisma_migrations') {
//       try {
//         await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
//       } catch (error) {
//         console.log({ error });
//       }
//     }
//   }
// });

