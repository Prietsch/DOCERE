/*
  Warnings:

  - You are about to drop the `_AlunoToChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatToProfessor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AlunoToChat" DROP CONSTRAINT "_AlunoToChat_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlunoToChat" DROP CONSTRAINT "_AlunoToChat_B_fkey";

-- DropForeignKey
ALTER TABLE "_ChatToProfessor" DROP CONSTRAINT "_ChatToProfessor_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatToProfessor" DROP CONSTRAINT "_ChatToProfessor_B_fkey";

-- DropTable
DROP TABLE "_AlunoToChat";

-- DropTable
DROP TABLE "_ChatToProfessor";

-- CreateTable
CREATE TABLE "_AlunoChats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProfessorChats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoChats_AB_unique" ON "_AlunoChats"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoChats_B_index" ON "_AlunoChats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfessorChats_AB_unique" ON "_ProfessorChats"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfessorChats_B_index" ON "_ProfessorChats"("B");

-- AddForeignKey
ALTER TABLE "_AlunoChats" ADD CONSTRAINT "_AlunoChats_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoChats" ADD CONSTRAINT "_AlunoChats_B_fkey" FOREIGN KEY ("B") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessorChats" ADD CONSTRAINT "_ProfessorChats_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessorChats" ADD CONSTRAINT "_ProfessorChats_B_fkey" FOREIGN KEY ("B") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
