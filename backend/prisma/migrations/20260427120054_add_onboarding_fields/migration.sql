-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experienceLevel" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "goalType" TEXT DEFAULT 'SAUDE',
ADD COLUMN     "height" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
