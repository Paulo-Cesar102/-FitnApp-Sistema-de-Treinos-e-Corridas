"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInController = void 0;
const CheckInService_1 = require("../services/CheckInService");
class CheckInController {
    checkInService;
    constructor() {
        this.checkInService = new CheckInService_1.CheckInService();
    }
    async performCheckIn(req, res) {
        try {
            const { gymId } = req.body;
            const userId = req.userId || req.user?.id;
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
        }
        catch (error) {
            console.error("Erro no CheckInController:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async getUserCheckIns(req, res) {
        try {
            const { userId, gymId } = req.params;
            const checkIns = await this.checkInService.getUserCheckIns(userId, gymId);
            return res.json(checkIns);
        }
        catch (error) {
            console.error("Erro no CheckInController:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async getGymCheckIns(req, res) {
        try {
            const { gymId } = req.params;
            const checkIns = await this.checkInService.getGymCheckIns(gymId);
            return res.json(checkIns);
        }
        catch (error) {
            console.error("Erro no CheckInController:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async getTodayCheckInCount(req, res) {
        try {
            const { gymId } = req.params;
            const count = await this.checkInService.getTodayCheckInCount(gymId);
            return res.json({ count });
        }
        catch (error) {
            console.error("Erro no CheckInController:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async getCheckInStreak(req, res) {
        try {
            const { userId, gymId } = req.params;
            const streak = await this.checkInService.getCheckInStreak(userId, gymId);
            return res.json({ streak });
        }
        catch (error) {
            console.error("Erro no CheckInController:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async getMonthlyCheckInCount(req, res) {
        try {
            const { userId, gymId } = req.params;
            const count = await this.checkInService.getMonthlyCheckInCount(userId, gymId);
            return res.json({ monthlyCount: count });
        }
        catch (error) {
            console.error("Erro no CheckInController:", error);
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.CheckInController = CheckInController;
