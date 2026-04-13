import { prisma } from "../database/prisma";
import { IRankingUser } from "../entities/Ranking";

export class RankingService {
  async getRanking(): Promise<IRankingUser[]> {
    const users = await prisma.user.findMany({
      orderBy: [
        { xp: "desc" },
        { level: "desc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
        createdAt: true,
      },
    });

    const ranking: IRankingUser[] = users.map((user, index) => ({
      position: index + 1,
      id: user.id,
      name: user.name,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt,
    }));

    return ranking;
  }
}