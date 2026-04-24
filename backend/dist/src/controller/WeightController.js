"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeightLogs = exports.addWeightLog = void 0;
const WeightService_1 = require("../services/WeightService");
const weightService = new WeightService_1.WeightService();
const addWeightLog = async (req, res) => {
    try {
        const { weight } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        if (!weight || typeof weight !== "number" || weight <= 0) {
            return res.status(400).json({ message: "Peso inválido" });
        }
        const weightLog = await weightService.addWeightLog(userId, weight);
        res.status(201).json(weightLog);
    }
    catch (error) {
        console.error("Erro ao adicionar log de peso:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};
exports.addWeightLog = addWeightLog;
const getWeightLogs = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const weightLogs = await weightService.getWeightLogs(userId);
        res.json(weightLogs);
    }
    catch (error) {
        console.error("Erro ao buscar logs de peso:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};
exports.getWeightLogs = getWeightLogs;
