import { prisma } from "../database/prisma";

interface CreateGymRankingInput {
  userId: string;
  gymId: string;
  checkInCount?: number;
  totalXpGained?: number;
  lastCheckedIn?: Date;
}

interface UpdateGymRankingInput {
  position?: number;
  checkInCount?: number;
  totalXpGained?: number;
  lastCheckedIn?: Date;
}

export class GymRankingRepository {
  async create(data: CreateGymRankingInput) {
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

  async findById(id: string) {
    return prisma.gymRanking.findUnique({
      where: { id },
      include: {
        user: true,
        gym: true,
      },
    });
  }

  async findByUserAndGym(userId: string, gymId: string) {
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

  async findByGym(gymId: string) {
    return prisma.gymRanking.findMany({
      where: { gymId },
      orderBy: { position: "asc" },
      include: {
        user: true,
        gym: true,
      },
    });
  }

  async findTop10ByGym(gymId: string) {
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

  async update(id: string, data: UpdateGymRankingInput) {
    return prisma.gymRanking.update({
      where: { id },
      data,
      include: {
        user: true,
        gym: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.gymRanking.delete({
      where: { id },
    });
  }

  async getUserRank(userId: string, gymId: string) {
    const ranking = await this.findByUserAndGym(userId, gymId);
    return ranking?.position || 0;
  }

  async getGymRankingStats(gymId: string) {
    const rankings = await this.findByGym(gymId);

    return {
      totalMembers: rankings.length,
      topRanked: rankings.slice(0, 10),
      totalXpEarned: rankings.reduce((sum, r) => sum + r.totalXpGained, 0),
      totalCheckIns: rankings.reduce((sum, r) => sum + r.checkInCount, 0),
    };
  }
}
