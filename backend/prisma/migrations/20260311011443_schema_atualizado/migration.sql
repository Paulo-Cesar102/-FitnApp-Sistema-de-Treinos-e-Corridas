/*
  Warnings:

  - You are about to drop the column `categoryId` on the `UserWorkout` table. All the data in the column will be lost.
  - You are about to drop the `Workout` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `xpEarned` to the `CompletedWorkout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompletedWorkout" DROP CONSTRAINT "CompletedWorkout_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkout" DROP CONSTRAINT "UserWorkout_categoryId_fkey";

-- AlterTable
ALTER TABLE "CompletedWorkout" ADD COLUMN     "xpEarned" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserWorkout" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Workout";

-- AddForeignKey
ALTER TABLE "CompletedWorkout" ADD CONSTRAINT "CompletedWorkout_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "UserWorkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
