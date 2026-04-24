"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseService = void 0;
const ExerciseRepository_1 = require("../repository/ExerciseRepository");
class ExerciseService {
    repository = new ExerciseRepository_1.ExerciseRepository();
    // =============================
    // LISTAR TODOS
    // =============================
    async getAllExercises() {
        return this.repository.findAll();
    }
    // =============================
    // BUSCAR POR ID
    // =============================
    async getExerciseById(id) {
        return this.repository.findById(id);
    }
    // =============================
    // BUSCAR POR CATEGORIA
    // =============================
    async getExercisesByCategory(categoryId) {
        return this.repository.findByCategory(categoryId);
    }
}
exports.ExerciseService = ExerciseService;
