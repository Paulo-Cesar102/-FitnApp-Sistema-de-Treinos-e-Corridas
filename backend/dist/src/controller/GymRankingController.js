"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymRankingController = void 0;
const GymRankingService_1 = require("../services/GymRankingService");
class GymRankingController {
    gymRankingService;
    constructor() {
        this.gymRankingService = new GymRankingService_1.GymRankingService();
    }
    async getGymRanking(req, res) {
        try {
            const { gymId } = req.params;
            const ranking = await this.gymRankingService.getGymRanking(gymId);
            return res.json(ranking);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getTop10Ranking(req, res) {
        try {
            const { gymId } = req.params;
            const topRanked = await this.gymRankingService.getTop10Ranking(gymId);
            return res.json(topRanked);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getUserRank(req, res) {
        try {
            const { userId, gymId } = req.params;
            const ranking = await this.gymRankingService.getUserRank(userId, gymId);
            if (!ranking) {
                return res
                    .status(404)
                    .json({
                    error: "Usuário não encontrado no ranking desta academia",
                });
            }
            return res.json(ranking);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getUserRankPosition(req, res) {
        try {
            const { userId, gymId } = req.params;
            const position = await this.gymRankingService.getUserRankPosition(userId, gymId);
            return res.json({ position });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getRankingStats(req, res) {
        try {
            const { gymId } = req.params;
            const stats = await this.gymRankingService.getRankingStats(gymId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.GymRankingController = GymRankingController;
