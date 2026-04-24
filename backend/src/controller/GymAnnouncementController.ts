import { Request, Response } from "express";
import { GymAnnouncementService } from "../services/GymAnnouncementService";

export class GymAnnouncementController {
  private announcementService: GymAnnouncementService;

  constructor() {
    this.announcementService = new GymAnnouncementService();
  }

  async createAnnouncement(req: Request, res: Response) {
    try {
      const { title, content, gymId, imageUrl, priority, isUrgent } =
        req.body;
      const createdBy = (req as any).userId || req.user?.id;

      if (!title || !content || !gymId || !createdBy) {
        console.error("Faltando campos obrigatórios para aviso:", { title, content, gymId, createdBy });
        return res.status(400).json({
          error:
            "title, content, gymId e createdBy são obrigatórios",
        });
      }

      // Mapeia isUrgent para priority se priority não for enviado
      let finalPriority = priority;
      if (finalPriority === undefined && isUrgent !== undefined) {
        finalPriority = isUrgent ? 2 : 0;
      }

      const announcement = await this.announcementService.createAnnouncement({
        title,
        content,
        gymId,
        createdBy,
        imageUrl,
        priority: finalPriority || 0,
      });

      return res.status(201).json(announcement);
    } catch (error: any) {
      console.error("Erro ao criar aviso:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async getAnnouncementById(req: Request, res: Response) {
    try {
      const { announcementId } = req.params as { announcementId: string };

      const announcement = await this.announcementService.getAnnouncementById(
        announcementId
      );

      if (!announcement) {
        return res
          .status(404)
          .json({ error: "Aviso não encontrado" });
      }

      return res.json(announcement);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getGymAnnouncements(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };
      const { page = 1, pageSize = 10 } = req.query;

      const result =
        await this.announcementService.getGymAnnouncementsPaginated(
          gymId,
          parseInt(page as string),
          parseInt(pageSize as string)
        );

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateAnnouncement(req: Request, res: Response) {
    try {
      const { announcementId } = req.params as { announcementId: string };
      const { title, content, imageUrl, priority } = req.body;

      const announcement = await this.announcementService.updateAnnouncement(
        announcementId,
        {
          title,
          content,
          imageUrl,
          priority,
        }
      );

      return res.json(announcement);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteAnnouncement(req: Request, res: Response) {
    try {
      const { announcementId } = req.params as { announcementId: string };

      await this.announcementService.deleteAnnouncement(announcementId);

      return res.json({
        message: "Aviso deletado com sucesso",
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getUrgentAnnouncements(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const announcements =
        await this.announcementService.getUrgentAnnouncements(gymId);

      return res.json(announcements);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
