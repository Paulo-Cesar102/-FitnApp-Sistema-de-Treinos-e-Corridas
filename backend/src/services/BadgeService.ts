import { prisma } from "../database/prisma";

export class BadgeService {
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