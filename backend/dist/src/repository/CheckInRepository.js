"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CheckInRepository {
    async create(data) {
        return prisma.checkIn.create({
            data: {
                userId: data.userId,
                gymId: data.gymId,
                streakBonus: data.streakBonus || 10,
            },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async findById(id) {
        return prisma.checkIn.findUnique({
            where: { id },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    // Obter check-in de hoje do usuário
    async getTodayCheckIn(userId, gymId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return prisma.checkIn.findFirst({
            where: {
                userId,
                gymId,
                checkedInAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
    }
    async getUserCheckIns(userId, gymId) {
        return prisma.checkIn.findMany({
            where: { userId, gymId },
            orderBy: { checkedInAt: "desc" },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async getGymCheckIns(gymId, limit = 30) {
        return prisma.checkIn.findMany({
            where: { gymId },
            orderBy: { checkedInAt: "desc" },
            take: limit,
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async getTodayCheckInCount(gymId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return prisma.checkIn.count({
            where: {
                gymId,
                checkedInAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
    }
    async getMonthlyCheckInCount(userId, gymId) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return prisma.checkIn.count({
            where: {
                userId,
                gymId,
                checkedInAt: {
                    gte: firstDay,
                    lt: now,
                },
            },
        });
    }
    async getCheckInStreak(userId, gymId) {
        const checkIns = await prisma.checkIn.findMany({
            where: { userId, gymId },
            orderBy: { checkedInAt: "desc" },
            take: 31,
        });
        if (checkIns.length === 0)
            return 0;
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        for (const checkIn of checkIns) {
            const checkInDate = new Date(checkIn.checkedInAt);
            checkInDate.setHours(0, 0, 0, 0);
            const diffTime = currentDate.getTime() - checkInDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            }
            else {
                break;
            }
        }
        return streak;
    }
}
exports.CheckInRepository = CheckInRepository;
