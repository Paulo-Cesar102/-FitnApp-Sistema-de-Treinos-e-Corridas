-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "workoutShareId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_workoutShareId_fkey" FOREIGN KEY ("workoutShareId") REFERENCES "WorkoutShare"("id") ON DELETE SET NULL ON UPDATE CASCADE;
