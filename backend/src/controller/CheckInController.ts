import { Request, Response } from "express";
import { CheckInService } from "../services/CheckInService";

export class CheckInController {
  private checkInService: CheckInService;

  constructor() {
    this.checkInService = new CheckInService();
  }

  async performCheckIn(req: Request, res: Response) {
    try {
      const { gymId } = req.body;
      const userId = (req as any).userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      if (!gymId) {
        return res.status(400).json({ error: "gymId é obrigatório" });
      }

      const checkIn = await this.checkInService.performCheckIn({
        userId,
        gymId,
      });

      return res.status(201).json({
        message: "Check-in realizado com sucesso!",
        checkIn,
      });
    } catch (error: any) {
      console.error("Erro no CheckInController:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserCheckIns(req: Request, res: Response) {
    try {
      const { userId, gymId } = req.params as { userId: string; gymId: string };

      const checkIns = await this.checkInService.getUserCheckIns(
        userId,
        gymId
      );

      return res.json(checkIns);
    } catch (error: any) {
      console.error("Erro no CheckInController:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async getGymCheckIns(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const checkIns = await this.checkInService.getGymCheckIns(gymId);

      return res.json(checkIns);
    } catch (error: any) {
      console.error("Erro no CheckInController:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async getTodayCheckInCount(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const count = await this.checkInService.getTodayCheckInCount(gymId);

      return res.json({ count });
    } catch (error: any) {
      console.error("Erro no CheckInController:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async getCheckInStreak(req: Request, res: Response) {
    try {
      const { userId, gymId } = req.params as { userId: string; gymId: string };

      const streak = await this.checkInService.getCheckInStreak(userId, gymId);

      return res.json({ streak });
    } catch (error: any) {
      console.error("Erro no CheckInController:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async getMonthlyCheckInCount(req: Request, res: Response) {
    try {
      const { userId, gymId } = req.params as { userId: string; gymId: string };

      const count = await this.checkInService.getMonthlyCheckInCount(
        userId,
        gymId
      );

      return res.json({ monthlyCount: count });
    } catch (error: any) {
      console.error("Erro no CheckInController:", error);
      return res.status(400).json({ error: error.message });
    }
  }
}
