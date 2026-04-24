"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const FeedbackRepository_1 = require("../repository/FeedbackRepository");
class FeedbackService {
    feedbackRepository = new FeedbackRepository_1.FeedbackRepository();
    async create(data) {
        if (data.rating < 1 || data.rating > 5) {
            throw new Error("Rating deve ser entre 1 e 5");
        }
        const feedback = await this.feedbackRepository.create(data);
        return feedback;
    }
    async delete(id) {
        // Se quiser, dá pra validar se existe antes
        await this.feedbackRepository.delete(id);
    }
}
exports.FeedbackService = FeedbackService;
