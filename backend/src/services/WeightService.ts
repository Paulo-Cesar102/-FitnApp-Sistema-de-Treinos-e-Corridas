import { prisma } from "../database/prisma";

export class WeightService {
  async addWeightLog(userId: string, weight: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const weightLog = await prisma.weightLog.create({
      data: {
        weight,
        userId,
      },
    });

    return weightLog;
  }

  async getWeightLogs(userId: string) {
    const weightLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    return weightLogs;
  }
}