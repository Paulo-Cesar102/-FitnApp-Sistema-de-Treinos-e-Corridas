import { Request, Response } from "express";
import { RankingService } from "../services/RankingService";

export class RankingController {
  private rankingService = new RankingService();

  async getRanking(req: Request, res: Response) {
    try {
      const ranking = await this.rankingService.getRanking();

      return res.status(200).json(ranking);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao buscar ranking",
      });
    }
  }
}