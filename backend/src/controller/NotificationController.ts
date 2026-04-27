import { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService";

export class NotificationController {
  private service = new NotificationService();

  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Não autorizado" });

      const notifications = await this.service.listByUser(userId);
      return res.json(notifications);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao listar notificações" });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.markRead(id as string);
      return res.json({ message: "Notificação lida" });
    } catch (error) {
      return res.status(400).json({ message: "Erro ao marcar como lida" });
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Não autorizado" });

      await this.service.markAllRead(userId);
      return res.json({ message: "Todas marcadas como lidas" });
    } catch (error) {
      return res.status(400).json({ message: "Erro ao marcar todas como lidas" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(id as string);
      return res.json({ message: "Notificação removida" });
    } catch (error) {
      return res.status(400).json({ message: "Erro ao remover notificação" });
    }
  }
}