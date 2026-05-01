import { prisma } from "../database/prisma";
import { NotificationService } from "./NotificationService";
import { io } from "../../server";

export class BadgeService {
  private notificationService = new NotificationService();

  async listAllBadges() {
    return prisma.badge.findMany({
      orderBy: { levelRequired: "asc" }
    });
  }

  async listUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { earnedAt: "desc" }
    });
  }

  async grantBadgesByLevel(userId: string, level: number) {
    const badges = await prisma.badge.findMany({
      where: {
        levelRequired: {
          lte: level,
        },
      },
    });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });

    const existingBadgeIds = userBadges.map((ub) => (ub as any).badgeId);
    const newBadges = [];

    for (const badge of badges) {
      if (!existingBadgeIds.includes(badge.id)) {
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
          include: {
            badge: true,
          },
        });

        // Emitir evento de conquista em tempo real
        io.to(userId).emit("badge:earned", {
          name: badge.name,
          icon: badge.icon,
          description: badge.description
        });

        // Salvar no banco de dados
        await this.notificationService.create(
          userId,
          "Nova Conquista!",
          `Você desbloqueou a medalha: ${badge.name}`,
          "BADGE_EARNED"
        );

        newBadges.push(userBadge);
      }
    }

    return newBadges;
  }
}
