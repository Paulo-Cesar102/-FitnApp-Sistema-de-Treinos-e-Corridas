import { CheckInRepository } from "../repository/CheckInRepository";
import { GymRankingRepository } from "../repository/GymRankingRepository";
import { UserRepository } from "../repository/UserRepository";

interface CreateCheckInRequest {
  userId: string;
  gymId: string;
}

export class CheckInService {
  private checkInRepository: CheckInRepository;
  private gymRankingRepository: GymRankingRepository;
  private userRepository: UserRepository;

  constructor() {
    this.checkInRepository = new CheckInRepository();
    this.gymRankingRepository = new GymRankingRepository();
    this.userRepository = new UserRepository();
  }

  async performCheckIn(data: CreateCheckInRequest) {
    // Verificar se já fez check-in hoje
    const todayCheckIn = await this.checkInRepository.getTodayCheckIn(
      data.userId,
      data.gymId
    );

    if (todayCheckIn) {
      throw new Error("Você já fez check-in hoje");
    }

    // Calcular streak
    const streak = await this.checkInRepository.getCheckInStreak(
      data.userId,
      data.gymId
    );

    // Calcular XP bonus baseado na streak
    const streakBonus = 10 + streak * 5; // 10 XP base + 5 por dia de streak

    // Criar check-in
    const checkIn = await this.checkInRepository.create({
      userId: data.userId,
      gymId: data.gymId,
      streakBonus,
    });

    // Atualizar ranking da academia
    await this.updateGymRanking(data.userId, data.gymId, streakBonus);

    // Atualizar XP e streak do usuário
    const user = await this.userRepository.findById(data.userId);
    if (user) {
      const newStreak = streak + 1;
      const newXp = (user.xp || 0) + streakBonus;
      const newMaxStreak = Math.max(user.maxStreak || 0, newStreak);

      await this.userRepository.update(data.userId, {
        xp: newXp,
        streak: newStreak,
        maxStreak: newMaxStreak,
        lastActivityDate: new Date(),
      });
    }

    return checkIn;
  }

  private async updateGymRanking(
    userId: string,
    gymId: string,
    xpGained: number
  ) {
    const existingRanking = await this.gymRankingRepository.findByUserAndGym(
      userId,
      gymId
    );

    if (existingRanking) {
      await this.gymRankingRepository.update(existingRanking.id, {
        checkInCount: existingRanking.checkInCount + 1,
        totalXpGained: existingRanking.totalXpGained + xpGained,
        lastCheckedIn: new Date(),
      });
    } else {
      await this.gymRankingRepository.create({
        userId,
        gymId,
        checkInCount: 1,
        totalXpGained: xpGained,
        lastCheckedIn: new Date(),
      });
    }
  }

  async getUserCheckIns(userId: string, gymId: string) {
    return this.checkInRepository.getUserCheckIns(userId, gymId);
  }

  async getGymCheckIns(gymId: string) {
    return this.checkInRepository.getGymCheckIns(gymId);
  }

  async getTodayCheckInCount(gymId: string) {
    return this.checkInRepository.getTodayCheckInCount(gymId);
  }

  async getCheckInStreak(userId: string, gymId: string) {
    return this.checkInRepository.getCheckInStreak(userId, gymId);
  }

  async getMonthlyCheckInCount(userId: string, gymId: string) {
    return this.checkInRepository.getMonthlyCheckInCount(userId, gymId);
  }
}
