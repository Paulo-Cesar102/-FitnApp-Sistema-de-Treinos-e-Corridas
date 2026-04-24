"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../database/prisma");
class UserRepository {
    async create(data) {
        const user = await prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                sex: data.sex,
                role: data.role ?? "USER"
            }
        });
        return user;
    }
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id }
        });
    }
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email }
        });
    }
    async findAll() {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                sex: true,
                level: true,
                xp: true,
                streak: true,
                maxStreak: true,
                weightGoal: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        completedWorkoutExercises: true,
                        completedWorkouts: true
                    }
                }
            }
        });
        return users.map(user => ({
            ...user,
            totalExercisesDone: user._count.completedWorkoutExercises,
            totalWorkoutsDone: user._count.completedWorkouts,
            _count: undefined
        }));
    }
    async delete(id) {
        await prisma_1.prisma.user.delete({
            where: { id }
        });
    }
    async update(id, data) {
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                sex: data.sex,
                weightGoal: data.weightGoal,
                level: data.level,
                xp: data.xp,
                streak: data.streak,
                maxStreak: data.maxStreak
            }
        });
        return user;
    }
}
exports.UserRepository = UserRepository;
