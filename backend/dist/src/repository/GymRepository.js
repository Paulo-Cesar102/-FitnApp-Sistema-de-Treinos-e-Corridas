"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../database/prisma");
class GymRepository {
    async findByIdOrCode(identifier) {
        return await prisma_1.prisma.gym.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { inviteCode: identifier }
                ]
            }
        });
    }
    async create(data) {
        return await prisma_1.prisma.gym.create({
            data
        });
    }
    async findByName(name) {
        return await prisma_1.prisma.gym.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            take: 10
        });
    }
    async updateMember(userId, gymId) {
        return await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { gymId }
        });
    }
}
exports.default = new GymRepository;
