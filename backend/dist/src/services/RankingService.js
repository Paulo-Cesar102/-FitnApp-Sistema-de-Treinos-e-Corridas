"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const prisma_1 = require("../database/prisma");
class RankingService {
    async getRanking() {
        const users = await prisma_1.prisma.user.findMany({
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
        const ranking = users.map((user, index) => ({
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
exports.RankingService = RankingService;
