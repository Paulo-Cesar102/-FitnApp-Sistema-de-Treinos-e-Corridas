"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const CategoryRepository_1 = require("../repository/CategoryRepository");
class CategoryService {
    repository = new CategoryRepository_1.CategoryRepository();
    async getCategories() {
        return this.repository.findAll();
    }
    async getCategoryById(id) {
        return this.repository.findById(id);
    }
    async getCategoryExercises(id) {
        return this.repository.getExercises(id);
    }
}
exports.CategoryService = CategoryService;
