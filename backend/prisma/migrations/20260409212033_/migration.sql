-- DropForeignKey
ALTER TABLE "UserWorkout" DROP CONSTRAINT "UserWorkout_userId_fkey";

-- AlterTable
ALTER TABLE "UserWorkout" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserWorkout" ADD CONSTRAINT "UserWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
