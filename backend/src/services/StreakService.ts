import { prisma } from "../database/prisma";

export class StreakService {
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = this.normalizeDate(date1);
    const d2 = this.normalizeDate(date2);
    return d1.getTime() === d2.getTime();
  }

  private isYesterday(lastDate: Date, currentDate: Date): boolean {
    const d1 = this.normalizeDate(lastDate);
    const d2 = this.normalizeDate(currentDate);
    
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diff = d2.getTime() - d1.getTime();

    // Aceita uma pequena margem para mudanças de fuso horário se necessário, 
    // mas com UTC puro deve ser exatamente oneDayInMs
    return diff === oneDayInMs;
  }

  async updateUserStreak(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const today = new Date();
    const todayNormalized = this.normalizeDate(today);

    if (!user.lastActivityDate) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          streak: 1,
          lastActivityDate: todayNormalized,
        },
      });

      return {
        streak: updatedUser.streak,
        lastActivityDate: updatedUser.lastActivityDate,
      };
    }

    const lastActivityDate = new Date(user.lastActivityDate);

    if (this.isSameDay(lastActivityDate, today)) {
      return {
        streak: user.streak,
        lastActivityDate: user.lastActivityDate,
      };
    }

    if (this.isYesterday(lastActivityDate, today)) {
      const newStreak = (user.streak ?? 0) + 1;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          maxStreak: Math.max(user.maxStreak ?? 0, newStreak),
          lastActivityDate: todayNormalized,
        },
      });

      return {
        streak: updatedUser.streak,
        lastActivityDate: updatedUser.lastActivityDate,
      };
    }

    // Se passou mais de um dia, reseta para 1
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        streak: 1,
        lastActivityDate: todayNormalized,
      },
    });

    return {
      streak: updatedUser.streak,
      lastActivityDate: updatedUser.lastActivityDate,
    };
  }
}
