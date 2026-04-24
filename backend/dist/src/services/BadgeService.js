"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeService = void 0;
const prisma_1 = require("../database/prisma");
class BadgeService {
    async grantBadgesByLevel(userId, userLevel) {
        const eligibleBadges = await prisma_1.prisma.badge.findMany({
            where: {
                levelRequired: {
                    lte: userLevel,
                },
            },
            orderBy: {
                levelRequired: "asc",
            },
        });
        const newBadges = [];
        for (const badge of eligibleBadges) {
            const alreadyHasBadge = await prisma_1.prisma.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId,
                        badgeId: badge.id,
                    },
                },
            });
            if (!alreadyHasBadge) {
                const userBadge = await prisma_1.prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                    },
                    include: {
                        badge: true,
                    },
                });
                newBadges.push(userBadge);
            }
        }
        return newBadges;
    }
    async listAllBadges() {
        return prisma_1.prisma.badge.findMany({
            orderBy: {
                levelRequired: "asc",
            },
        });
    }
    async listUserBadges(userId) {
        return prisma_1.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { earnedAt: "asc" },
        });
    }
}
exports.BadgeService = BadgeService;
