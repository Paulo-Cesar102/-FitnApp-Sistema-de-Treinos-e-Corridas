"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const NotificationRepository_1 = require("../repository/NotificationRepository");
class NotificationService {
    repository = new NotificationRepository_1.NotificationRepository();
    async create(userId, title, message, type) {
        return this.repository.create({ userId, title, message, type });
    }
    async listByUser(userId) {
        return this.repository.findByUserId(userId);
    }
    async markRead(id) {
        return this.repository.markAsRead(id);
    }
    async markAllRead(userId) {
        return this.repository.markAllAsRead(userId);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
}
exports.NotificationService = NotificationService;
