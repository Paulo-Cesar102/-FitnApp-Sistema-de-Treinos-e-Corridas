import { Request, Response } from "express";
import { FeedbackService } from "../services/FeedbackService";

export class FeedbackController {

    private feedbackService = new FeedbackService();

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, message, rating } = req.body;

            const feedback = await this.feedbackService.create({
                userId,
                message,
                rating,
            });

            return res.status(201).json(feedback);
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || "Erro ao criar feedback",
            });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            await this.feedbackService.delete(String(id));


            return res.status(204).send();
        } catch (error: any) {
            return res.status(400).json({
                message: error.message || "Erro ao deletar feedback",
            });
        }
    }
}
