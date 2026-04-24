"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymRankingService = void 0;
const GymRankingRepository_1 = require("../repository/GymRankingRepository");
class GymRankingService {
    gymRankingRepository;
    constructor() {
        this.gymRankingRepository = new GymRankingRepository_1.GymRankingRepository();
    }
    async getGymRanking(gymId) {
        return this.gymRankingRepository.findByGym(gymId);
    }
    async getTop10Ranking(gymId) {
        return this.gymRankingRepository.findTop10ByGym(gymId);
    }
    async getUserRank(userId, gymId) {
        return this.gymRankingRepository.findByUserAndGym(userId, gymId);
    }
    async getUserRankPosition(userId, gymId) {
        return this.gymRankingRepository.getUserRank(userId, gymId);
    }
    async getRankingStats(gymId) {
        return this.gymRankingRepository.getGymRankingStats(gymId);
    }
}
exports.GymRankingService = GymRankingService;
