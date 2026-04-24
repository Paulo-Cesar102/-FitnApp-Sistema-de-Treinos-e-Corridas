"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingController = void 0;
const RankingService_1 = require("../services/RankingService");
class RankingController {
    rankingService = new RankingService_1.RankingService();
    async getRanking(req, res) {
        try {
            const ranking = await this.rankingService.getRanking();
            return res.status(200).json(ranking);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar ranking",
            });
        }
    }
}
exports.RankingController = RankingController;
