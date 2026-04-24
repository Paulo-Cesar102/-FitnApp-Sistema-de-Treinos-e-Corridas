"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreakService = void 0;
const prisma_1 = require("../database/prisma");
class StreakService {
    normalizeDate(date) {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }
    isSameDay(date1, date2) {
        return this.normalizeDate(date1).getTime() === this.normalizeDate(date2).getTime();
    }
    isYesterday(lastDate, currentDate) {
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const normalizedLastDate = this.normalizeDate(lastDate);
        const normalizedCurrentDate = this.normalizeDate(currentDate);
        return normalizedCurrentDate.getTime() - normalizedLastDate.getTime() === oneDayInMs;
    }
    async updateUserStreak(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        const today = new Date();
        const todayNormalized = this.normalizeDate(today);
        if (!user.lastActivityDate) {
            const updatedUser = await prisma_1.prisma.user.update({
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
            const updatedUser = await prisma_1.prisma.user.update({
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
        const updatedUser = await prisma_1.prisma.user.update({
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
exports.StreakService = StreakService;
