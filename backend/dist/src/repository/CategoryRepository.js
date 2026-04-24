"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const prisma_1 = require("../database/prisma");
class CategoryRepository {
    async findAll() {
        return prisma_1.prisma.category.findMany();
    }
    async findById(id) {
        return prisma_1.prisma.category.findUnique({
            where: { id }
        });
    }
    async getExercises(id) {
        return prisma_1.prisma.exercise.findMany({
            where: {
                categoryId: id
            }
        });
    }
}
exports.CategoryRepository = CategoryRepository;
