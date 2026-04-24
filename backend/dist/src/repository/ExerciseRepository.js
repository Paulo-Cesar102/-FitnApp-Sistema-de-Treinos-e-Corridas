"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseRepository = void 0;
const prisma_1 = require("../database/prisma");
class ExerciseRepository {
    async findAll() {
        return prisma_1.prisma.exercise.findMany({
            include: {
                category: true,
                primaryMuscle: true,
            }
        });
    }
    async findById(id) {
        return prisma_1.prisma.exercise.findUnique({
            where: { id },
            include: {
                category: true,
                primaryMuscle: true,
            }
        });
    }
    async findByCategory(categoryId) {
        return prisma_1.prisma.exercise.findMany({
            where: {
                categoryId
            },
            include: {
                primaryMuscle: true,
            }
        });
    }
    async findAllCategories() {
        return prisma_1.prisma.category.findMany({
            include: {
                exercises: {
                    include: {
                        primaryMuscle: true
                    }
                }
            }
        });
    }
}
exports.ExerciseRepository = ExerciseRepository;
