-- CreateTable
CREATE TABLE "GymPersonal" (
    "id" TEXT NOT NULL,
    "specialization" TEXT,
    "bio" TEXT,
    "certifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "GymPersonal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymPersonalStudent" (
    "id" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GymPersonalStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymPersonalChat" (
    "id" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GymPersonalChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "streakBonus" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gymId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "GymAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymRanking" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "checkInCount" INTEGER NOT NULL DEFAULT 0,
    "totalXpGained" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedIn" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,

    CONSTRAINT "GymRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GymPersonal_userId_key" ON "GymPersonal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GymPersonalStudent_personalId_studentId_key" ON "GymPersonalStudent"("personalId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "GymPersonalChat_personalId_chatId_key" ON "GymPersonalChat"("personalId", "chatId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_userId_gymId_checkedInAt_key" ON "CheckIn"("userId", "gymId", "checkedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "GymRanking_userId_gymId_key" ON "GymRanking"("userId", "gymId");

-- AddForeignKey
ALTER TABLE "GymPersonal" ADD CONSTRAINT "GymPersonal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPersonal" ADD CONSTRAINT "GymPersonal_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPersonalStudent" ADD CONSTRAINT "GymPersonalStudent_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "GymPersonal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPersonalStudent" ADD CONSTRAINT "GymPersonalStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPersonalChat" ADD CONSTRAINT "GymPersonalChat_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "GymPersonal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymPersonalChat" ADD CONSTRAINT "GymPersonalChat_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymAnnouncement" ADD CONSTRAINT "GymAnnouncement_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymRanking" ADD CONSTRAINT "GymRanking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymRanking" ADD CONSTRAINT "GymRanking_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
