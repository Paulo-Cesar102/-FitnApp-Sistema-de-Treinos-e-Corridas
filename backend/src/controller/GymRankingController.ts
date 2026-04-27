import { Request, Response } from "express";
import { GymRankingService } from "../services/GymRankingService";

export class GymRankingController {
  private gymRankingService: GymRankingService;

  constructor() {
    this.gymRankingService = new GymRankingService();
  }

  async getGymRanking(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const ranking = await this.gymRankingService.getGymRanking(gymId, limit, offset);

      return res.json(ranking);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getTop10Ranking(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const topRanked = await this.gymRankingService.getTop10Ranking(gymId);

      return res.json(topRanked);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserRank(req: Request, res: Response) {
    try {
      const { userId, gymId } = req.params as { userId: string; gymId: string };

      const ranking = await this.gymRankingService.getUserRank(userId, gymId);

      if (!ranking) {
        return res
          .status(404)
          .json({
            error: "Usuário não encontrado no ranking desta academia",
          });
      }

      return res.json(ranking);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserRankPosition(req: Request, res: Response) {
    try {
      const { userId, gymId } = req.params as { userId: string; gymId: string };

      const position = await this.gymRankingService.getUserRankPosition(
        userId,
        gymId
      );

      return res.json({ position });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getRankingStats(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const stats = await this.gymRankingService.getRankingStats(gymId);

      return res.json(stats);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
