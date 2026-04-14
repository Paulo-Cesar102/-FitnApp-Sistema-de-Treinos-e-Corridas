import { Request, Response } from "express";
import { BadgeService } from "../services/BadgeService";

export class BadgeController {
  private badgeService = new BadgeService();

  async listAll(req: Request, res: Response) {
    try {
      const badges = await this.badgeService.listAllBadges();

      return res.status(200).json(badges);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao listar conquistas",
      });
    }
  }

  async listMyBadges(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Usuário não autenticado",
        });
      }

      const userBadges = await this.badgeService.listUserBadges(userId);

      return res.status(200).json(userBadges);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao listar conquistas do usuário",
      });
    }
  }
}