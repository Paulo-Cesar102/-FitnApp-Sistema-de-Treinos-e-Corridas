import { prisma } from "../database/prisma";
import { io } from "../../server";
import { NotificationService } from "./NotificationService";

export class BadgeService {
  private notificationService = new NotificationService();

  async grantBadgesByLevel(userId: string, userLevel: number) {
    const eligibleBadges = await prisma.badge.findMany({
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
      const alreadyHasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
      });

      if (!alreadyHasBadge) {
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
          include: {
            badge: true,
          },
        });

        // 🔥 Emitir evento de badge conquistada em tempo real
        io.to(userId).emit("badge:earned", {
          name: badge.name,
          icon: badge.icon,
          description: badge.description
        });

        // 💾 Salvar no banco de dados
        await this.notificationService.create(
          userId,
          "🏆 Nova Conquista!",
          `Você desbloqueou a medalha: ${badge.name}`,
          "BADGE_EARNED"
        );

        newBadges.push(userBadge);
      }
    }

    return newBadges;
  }

  async listAllBadges() {
    return prisma.badge.findMany({
      orderBy: {
        levelRequired: "asc",
      },
    });
  }

  async listUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "asc" },
    });
  }
}