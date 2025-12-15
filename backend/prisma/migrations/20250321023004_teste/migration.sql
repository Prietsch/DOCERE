/*
  Warnings:

  - Made the column `nota` on table `Redacao` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Redacao" ALTER COLUMN "nota" SET NOT NULL;
