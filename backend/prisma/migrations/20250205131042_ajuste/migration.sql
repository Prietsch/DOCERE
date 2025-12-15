/*
  Warnings:

  - A unique constraint covering the columns `[cursoId,alunoId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Progress_cursoId_alunoId_key" ON "Progress"("cursoId", "alunoId");
