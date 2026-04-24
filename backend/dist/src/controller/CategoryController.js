"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CategoryService_1 = require("../services/CategoryService");
class CategoryController {
    service = new CategoryService_1.CategoryService();
    async getAll(req, res) {
        const categories = await this.service.getCategories();
        return res.json(categories);
    }
    async getById(req, res) {
        const { id } = req.params;
        const category = await this.service.getCategoryById(id);
        return res.json(category);
    }
    async getExercises(req, res) {
        const { id } = req.params;
        const exercises = await this.service.getCategoryExercises(id);
        return res.json(exercises);
    }
}
exports.CategoryController = CategoryController;
