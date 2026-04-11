/*
  Warnings:

  - You are about to drop the column `capa` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "capa",
ADD COLUMN     "tutorial" TEXT;
