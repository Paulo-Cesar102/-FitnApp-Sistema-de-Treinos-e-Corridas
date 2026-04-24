"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutController = void 0;
const WorkoutService_1 = require("../services/WorkoutService");
class WorkoutController {
    workoutService = new WorkoutService_1.WorkoutService();
    async create(req, res) {
        try {
            const { name, exercises } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            if (!name || !exercises) {
                return res
                    .status(400)
                    .json({ message: "Nome e exercícios são obrigatórios" });
            }
            const workout = await this.workoutService.create({
                name,
                userId,
                exercises,
            });
            return res.status(201).json(workout);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao criar treino",
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, exercises } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            if (!name || !exercises) {
                return res
                    .status(400)
                    .json({ message: "Nome e exercícios são obrigatórios" });
            }
            // Idealmente, deve-se verificar se o usuário é o dono do treino antes de atualizar
            const workout = await this.workoutService.update(id, { name, exercises });
            return res.status(200).json(workout);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao atualizar treino",
            });
        }
    }
    async findAll(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            const workouts = await this.workoutService.findAll(userId);
            return res.json(workouts);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao listar treinos",
            });
        }
    }
    async getUserWorkouts(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            const workouts = await this.workoutService.getUserWorkouts(userId);
            return res.status(200).json(workouts);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Erro ao buscar treinos do usuário",
            });
        }
    }
    async getWorkoutsByUserId(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ message: "userId é obrigatório" });
            }
            const workouts = await this.workoutService.getUserWorkouts(userId);
            return res.status(200).json(workouts);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Erro ao buscar treinos do usuário específico",
            });
        }
    }
    async getCatalog(req, res) {
        try {
            const catalog = await this.workoutService.getCatalog();
            return res.status(200).json(catalog);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar catálogo",
            });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (Array.isArray(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }
            await this.workoutService.delete(id);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao deletar treino",
            });
        }
    }
    async complete(req, res) {
        try {
            const userId = req.user?.id;
            const { workoutId } = req.body;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            if (!workoutId) {
                return res.status(400).json({ message: "workoutId é obrigatório" });
            }
            const result = await this.workoutService.completeWorkout(userId, workoutId);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao concluir treino",
            });
        }
    }
    async completeExercise(req, res) {
        try {
            const userId = req.user?.id;
            const { workoutId, exerciseId } = req.body;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            if (!workoutId || !exerciseId) {
                return res.status(400).json({
                    message: "workoutId e exerciseId são obrigatórios",
                });
            }
            const result = await this.workoutService.completeExercise(userId, workoutId, exerciseId);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Erro ao concluir exercício",
            });
        }
    }
    async getFocusStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            const stats = await this.workoutService.getFocusDistribution(userId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar foco",
            });
        }
    }
    async getWeeklyStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não identificado" });
            }
            const stats = await this.workoutService.getWeeklyStats(userId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar semanal",
            });
        }
    }
}
exports.WorkoutController = WorkoutController;
