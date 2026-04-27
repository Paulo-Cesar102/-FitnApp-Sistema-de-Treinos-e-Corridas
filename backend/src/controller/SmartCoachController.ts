import { Request, Response } from "express";
import { SmartCoachService } from "../services/SmartCoachService";

export class SmartCoachController {
  private service = new SmartCoachService();

  async ask(req: Request, res: Response) {
    try {
      console.log("Recebendo pergunta do SmartCoach:", req.body);
      const { question } = req.body;
      const userId = (req as any).userId;

      if (!userId) {
        console.warn("Usuário não autenticado na rota SmartCoach");
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!question) {
        console.warn("Pergunta ausente no corpo da requisição");
        return res.status(400).json({ message: "A pergunta é obrigatória" });
      }

      const result = await this.service.askCoach(userId, question);
      return res.json(result);
    } catch (error: any) {
      console.error("Erro no SmartCoachController:", error);
      return res.status(500).json({ message: "Erro ao processar sua pergunta", error: error.message });
    }
  }
}
