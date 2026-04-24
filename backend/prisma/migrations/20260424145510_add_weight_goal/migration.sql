/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "weightGoal" DOUBLE PRECISION DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Gym_ownerId_key" ON "Gym"("ownerId");

-- AddForeignKey
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
