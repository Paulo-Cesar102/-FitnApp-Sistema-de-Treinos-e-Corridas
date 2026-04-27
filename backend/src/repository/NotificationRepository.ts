import { prisma } from "../database/prisma";

export class NotificationRepository {
  async create(data: { userId: string; title: string; message: string; type: string }) {
    return prisma.notification.create({
      data
    });
  }

  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: { id }
    });
  }
}