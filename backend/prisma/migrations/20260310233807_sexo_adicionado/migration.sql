-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sex" "Sex" NOT NULL DEFAULT 'M';
