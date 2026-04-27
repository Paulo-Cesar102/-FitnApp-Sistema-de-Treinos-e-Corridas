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

  async findByGym(gymId: string, limit: number = 50, offset: number = 0) {
    return prisma.gymRanking.findMany({
      where: { gymId },
      orderBy: { totalXpGained: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            level: true,
            xp: true,
          }
        },
      },
    });
  }

  async findTop10ByGym(gymId: string) {
    return this.findByGym(gymId, 10, 0);
  }

  async update(id: string, data: UpdateGymRankingInput) {
    return prisma.gymRanking.update({
      where: { id },
      data,
      include: {
        user: true,
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
    if (!ranking) return 0;

    // Conta quantos usuários têm mais XP que o usuário atual para determinar a posição
    const count = await prisma.gymRanking.count({
      where: {
        gymId,
        totalXpGained: {
          gt: ranking.totalXpGained
        }
      }
    });

    return count + 1;
  }

  async getGymRankingStats(gymId: string) {
    const totalMembers = await prisma.gymRanking.count({ where: { gymId } });
    const topRanked = await this.findTop10ByGym(gymId);
    
    const aggregates = await prisma.gymRanking.aggregate({
      where: { gymId },
      _sum: {
        totalXpGained: true,
        checkInCount: true
      }
    });

    return {
      totalMembers,
      topRanked,
      totalXpEarned: aggregates._sum.totalXpGained || 0,
      totalCheckIns: aggregates._sum.checkInCount || 0,
    };
  }
}
