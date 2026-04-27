import { GymRankingRepository } from "../repository/GymRankingRepository";

export class GymRankingService {
  private gymRankingRepository: GymRankingRepository;

  constructor() {
    this.gymRankingRepository = new GymRankingRepository();
  }

  async getGymRanking(gymId: string, limit: number = 50, offset: number = 0) {
    return this.gymRankingRepository.findByGym(gymId, limit, offset);
  }

  async getTop10Ranking(gymId: string) {
    return this.gymRankingRepository.findTop10ByGym(gymId);
  }

  async getUserRank(userId: string, gymId: string) {
    return this.gymRankingRepository.findByUserAndGym(userId, gymId);
  }

  async getUserRankPosition(userId: string, gymId: string) {
    return this.gymRankingRepository.getUserRank(userId, gymId);
  }

  async getRankingStats(gymId: string) {
    return this.gymRankingRepository.getGymRankingStats(gymId);
  }
}
