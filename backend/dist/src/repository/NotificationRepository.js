"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = require("../database/prisma");
class NotificationRepository {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data
        });
    }
    async findByUserId(userId) {
        return prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
    }
    async markAsRead(id) {
        return prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }
    async markAllAsRead(userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
    async delete(id) {
        return prisma_1.prisma.notification.delete({
            where: { id }
        });
    }
}
exports.NotificationRepository = NotificationRepository;
