"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeController = void 0;
const BadgeService_1 = require("../services/BadgeService");
class BadgeController {
    badgeService = new BadgeService_1.BadgeService();
    async listAll(req, res) {
        try {
            const badges = await this.badgeService.listAllBadges();
            return res.status(200).json(badges);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Erro ao listar conquistas",
            });
        }
    }
    async listMyBadges(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: "Usuário não autenticado",
                });
            }
            const userBadges = await this.badgeService.listUserBadges(userId);
            return res.status(200).json(userBadges);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Erro ao listar conquistas do usuário",
            });
        }
    }
}
exports.BadgeController = BadgeController;
