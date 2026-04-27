import { NotificationRepository } from "../repository/NotificationRepository";

export class NotificationService {
  private repository = new NotificationRepository();

  async create(userId: string, title: string, message: string, type: string) {
    return this.repository.create({ userId, title, message, type });
  }

  async listByUser(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async markRead(id: string) {
    return this.repository.markAsRead(id);
  }

  async markAllRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}