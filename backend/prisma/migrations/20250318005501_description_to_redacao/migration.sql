/*
  Warnings:

  - Added the required column `descricao` to the `Redacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Redacao" ADD COLUMN     "descricao" TEXT NOT NULL;
