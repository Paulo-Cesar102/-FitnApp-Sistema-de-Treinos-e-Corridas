"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightService = void 0;
const prisma_1 = require("../database/prisma");
class WeightService {
    async addWeightLog(userId, weight) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        const weightLog = await prisma_1.prisma.weightLog.create({
            data: {
                weight,
                userId,
            },
        });
        return weightLog;
    }
    async getWeightLogs(userId) {
        const weightLogs = await prisma_1.prisma.weightLog.findMany({
            where: { userId },
            orderBy: { date: "asc" },
        });
        return weightLogs;
    }
}
exports.WeightService = WeightService;
