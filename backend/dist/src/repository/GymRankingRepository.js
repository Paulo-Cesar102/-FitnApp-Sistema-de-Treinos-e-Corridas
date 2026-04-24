"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymRankingRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class GymRankingRepository {
    async create(data) {
        return prisma.gymRanking.create({
            data: {
                userId: data.userId,
                gymId: data.gymId,
                checkInCount: data.checkInCount || 0,
                totalXpGained: data.totalXpGained || 0,
                lastCheckedIn: data.lastCheckedIn,
                position: 0,
            },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async findById(id) {
        return prisma.gymRanking.findUnique({
            where: { id },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async findByUserAndGym(userId, gymId) {
        return prisma.gymRanking.findUnique({
            where: {
                userId_gymId: {
                    userId,
                    gymId,
                },
            },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async findByGym(gymId) {
        return prisma.gymRanking.findMany({
            where: { gymId },
            orderBy: { position: "asc" },
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async findTop10ByGym(gymId) {
        return prisma.gymRanking.findMany({
            where: { gymId },
            orderBy: { position: "asc" },
            take: 10,
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async update(id, data) {
        return prisma.gymRanking.update({
            where: { id },
            data,
            include: {
                user: true,
                gym: true,
            },
        });
    }
    async delete(id) {
        return prisma.gymRanking.delete({
            where: { id },
        });
    }
    async getUserRank(userId, gymId) {
        const ranking = await this.findByUserAndGym(userId, gymId);
        return ranking?.position || 0;
    }
    async getGymRankingStats(gymId) {
        const rankings = await this.findByGym(gymId);
        return {
            totalMembers: rankings.length,
            topRanked: rankings.slice(0, 10),
            totalXpEarned: rankings.reduce((sum, r) => sum + r.totalXpGained, 0),
            totalCheckIns: rankings.reduce((sum, r) => sum + r.checkInCount, 0),
        };
    }
}
exports.GymRankingRepository = GymRankingRepository;
