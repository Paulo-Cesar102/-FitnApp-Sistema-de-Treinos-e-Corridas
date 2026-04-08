-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "level" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "reps" INTEGER;
