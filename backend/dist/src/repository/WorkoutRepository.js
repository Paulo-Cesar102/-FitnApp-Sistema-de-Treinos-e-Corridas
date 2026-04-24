"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutRepository = void 0;
const prisma_1 = require("../database/prisma");
class WorkoutRepository {
    async create(data) {
        const workout = await prisma_1.prisma.userWorkout.create({
            data: {
                name: data.name,
                userId: data.userId,
                exercises: {
                    create: data.exercises.map((exercise) => ({
                        exerciseId: exercise.exerciseId,
                        sets: exercise.sets,
                        reps: exercise.reps,
                    })),
                },
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                },
            },
        });
        return workout;
    }
    async findAll(userId) {
        const workouts = await prisma_1.prisma.userWorkout.findMany({
            where: {
                userId,
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                },
            },
        });
        return workouts;
    }
    async findById(id) {
        const workout = await prisma_1.prisma.userWorkout.findUnique({
            where: {
                id,
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                },
            },
        });
        return workout;
    }
    async delete(id) {
        await prisma_1.prisma.userWorkout.delete({
            where: {
                id,
            },
        });
    }
}
exports.WorkoutRepository = WorkoutRepository;
