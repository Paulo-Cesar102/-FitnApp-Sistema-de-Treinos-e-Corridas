"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInService = void 0;
const CheckInRepository_1 = require("../repository/CheckInRepository");
const GymRankingRepository_1 = require("../repository/GymRankingRepository");
const UserRepository_1 = require("../repository/UserRepository");
class CheckInService {
    checkInRepository;
    gymRankingRepository;
    userRepository;
    constructor() {
        this.checkInRepository = new CheckInRepository_1.CheckInRepository();
        this.gymRankingRepository = new GymRankingRepository_1.GymRankingRepository();
        this.userRepository = new UserRepository_1.UserRepository();
    }
    async performCheckIn(data) {
        // Verificar se já fez check-in hoje
        const todayCheckIn = await this.checkInRepository.getTodayCheckIn(data.userId, data.gymId);
        if (todayCheckIn) {
            throw new Error("Você já fez check-in hoje");
        }
        // Calcular streak
        const streak = await this.checkInRepository.getCheckInStreak(data.userId, data.gymId);
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
    async updateGymRanking(userId, gymId, xpGained) {
        const existingRanking = await this.gymRankingRepository.findByUserAndGym(userId, gymId);
        if (existingRanking) {
            await this.gymRankingRepository.update(existingRanking.id, {
                checkInCount: existingRanking.checkInCount + 1,
                totalXpGained: existingRanking.totalXpGained + xpGained,
                lastCheckedIn: new Date(),
            });
        }
        else {
            await this.gymRankingRepository.create({
                userId,
                gymId,
                checkInCount: 1,
                totalXpGained: xpGained,
                lastCheckedIn: new Date(),
            });
        }
        // Atualizar posições do ranking
        await this.refreshGymRankingPositions(gymId);
    }
    async refreshGymRankingPositions(gymId) {
        const rankings = await this.gymRankingRepository.findByGym(gymId);
        // Ordenar por totalXpGained em ordem decrescente
        const sortedRankings = rankings.sort((a, b) => b.totalXpGained - a.totalXpGained);
        // Atualizar posições
        for (let i = 0; i < sortedRankings.length; i++) {
            await this.gymRankingRepository.update(sortedRankings[i].id, {
                position: i + 1,
            });
        }
    }
    async getUserCheckIns(userId, gymId) {
        return this.checkInRepository.getUserCheckIns(userId, gymId);
    }
    async getGymCheckIns(gymId) {
        return this.checkInRepository.getGymCheckIns(gymId);
    }
    async getTodayCheckInCount(gymId) {
        return this.checkInRepository.getTodayCheckInCount(gymId);
    }
    async getCheckInStreak(userId, gymId) {
        return this.checkInRepository.getCheckInStreak(userId, gymId);
    }
    async getMonthlyCheckInCount(userId, gymId) {
        return this.checkInRepository.getMonthlyCheckInCount(userId, gymId);
    }
}
exports.CheckInService = CheckInService;
