"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const FeedbackService_1 = require("../services/FeedbackService");
class FeedbackController {
    feedbackService = new FeedbackService_1.FeedbackService();
    async create(req, res) {
        try {
            const { userId, message, rating } = req.body;
            const feedback = await this.feedbackService.create({
                userId,
                message,
                rating,
            });
            return res.status(201).json(feedback);
        }
        catch (error) {
            return res.status(400).json({
                message: error.message || "Erro ao criar feedback",
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.feedbackService.delete(String(id));
            return res.status(204).send();
        }
        catch (error) {
            return res.status(400).json({
                message: error.message || "Erro ao deletar feedback",
            });
        }
    }
}
exports.FeedbackController = FeedbackController;
