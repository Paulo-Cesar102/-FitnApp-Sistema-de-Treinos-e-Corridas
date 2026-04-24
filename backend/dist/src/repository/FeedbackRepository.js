"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRepository = void 0;
const prisma_1 = require("../database/prisma");
class FeedbackRepository {
    async create(data) {
        const feedback = await prisma_1.prisma.feedback.create({
            data
        });
        return feedback;
    }
    async findById(id) {
        return prisma_1.prisma.feedback.findUnique({
            where: { id }
        });
    }
    async findAll() {
        return prisma_1.prisma.feedback.findMany();
    }
    async delete(id) {
        await prisma_1.prisma.feedback.delete({
            where: { id }
        });
    }
}
exports.FeedbackRepository = FeedbackRepository;
