/*
  Warnings:

  - Added the required column `tipo` to the `Pergunta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PerguntaTipo" AS ENUM ('MULTIPLE_CHOICE', 'OPEN_TEXT');

-- AlterTable
ALTER TABLE "Pergunta" ADD COLUMN     "alternativas" TEXT,
ADD COLUMN     "tipo" "PerguntaTipo" NOT NULL;

-- CreateTable
CREATE TABLE "Progress" (
    "id" SERIAL NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "courseProgress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
