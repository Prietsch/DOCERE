/*
  Warnings:

  - You are about to drop the column `ordem` on the `Aula` table. All the data in the column will be lost.
  - You are about to drop the column `ordem` on the `Modulo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aula" DROP COLUMN "ordem";

-- AlterTable
ALTER TABLE "Modulo" DROP COLUMN "ordem";
