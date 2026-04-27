"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeService = void 0;
const prisma_1 = require("../database/prisma");
const server_1 = require("../../server");
const NotificationService_1 = require("./NotificationService");
class BadgeService {
    notificationService = new NotificationService_1.NotificationService();
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
                // 🔥 Emitir evento de badge conquistada em tempo real
                server_1.io.to(userId).emit("badge:earned", {
                    name: badge.name,
                    icon: badge.icon,
                    description: badge.description
                });
                // 💾 Salvar no banco de dados
                await this.notificationService.create(userId, "🏆 Nova Conquista!", `Você desbloqueou a medalha: ${badge.name}`, "BADGE_EARNED");
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
