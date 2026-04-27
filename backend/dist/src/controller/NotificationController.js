"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationService_1 = require("../services/NotificationService");
class NotificationController {
    service = new NotificationService_1.NotificationService();
    async list(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: "Não autorizado" });
            const notifications = await this.service.listByUser(userId);
            return res.json(notifications);
        }
        catch (error) {
            return res.status(400).json({ message: "Erro ao listar notificações" });
        }
    }
    async markRead(req, res) {
        try {
            const { id } = req.params;
            await this.service.markRead(id);
            return res.json({ message: "Notificação lida" });
        }
        catch (error) {
            return res.status(400).json({ message: "Erro ao marcar como lida" });
        }
    }
    async markAllRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: "Não autorizado" });
            await this.service.markAllRead(userId);
            return res.json({ message: "Todas marcadas como lidas" });
        }
        catch (error) {
            return res.status(400).json({ message: "Erro ao marcar todas como lidas" });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.service.delete(id);
            return res.json({ message: "Notificação removida" });
        }
        catch (error) {
            return res.status(400).json({ message: "Erro ao remover notificação" });
        }
    }
}
exports.NotificationController = NotificationController;
