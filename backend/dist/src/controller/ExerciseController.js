"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseController = void 0;
const ExerciseService_1 = require("../services/ExerciseService");
class ExerciseController {
    service = new ExerciseService_1.ExerciseService();
    async getAll(req, res) {
        const exercises = await this.service.getAllExercises();
        return res.json(exercises);
    }
    async getById(req, res) {
        const { id } = req.params;
        const exercise = await this.service.getExerciseById(id);
        if (!exercise) {
            return res.status(404).json({
                message: "Exercício não encontrado"
            });
        }
        return res.json(exercise);
    }
    async getByCategory(req, res) {
        const { categoryId } = req.params;
        const exercises = await this.service.getExercisesByCategory(categoryId);
        return res.json(exercises);
    }
}
exports.ExerciseController = ExerciseController;
