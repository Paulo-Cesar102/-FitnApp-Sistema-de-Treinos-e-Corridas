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
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                ownedGym: true,
                gym: true,
                _count: {
                    select: {
                        completedWorkouts: true,
                        completedWorkoutExercises: true
                    }
                }
            }
        });
        if (!user)
            return null;
        return {
            ...user,
            totalWorkoutsDone: user._count.completedWorkouts,
            totalExercisesDone: user._count.completedWorkoutExercises,
            _count: undefined
        };
    }
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                ownedGym: true,
                gym: true
            }
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
        // 🔥 Filtra apenas os campos que foram enviados (diferentes de undefined)
        // Isso evita que campos obrigatórios recebam 'undefined' por engano.
        const updateData = {};
        const fields = [
            "name", "email", "password", "sex", "weightGoal", "height",
            "goalType", "experienceLevel", "onboardingCompleted",
            "level", "xp", "streak", "maxStreak", "lastActivityDate", "gymId",
            "lastUnsubscribedAt",
            "isPublicProfile", "notificationsEnabled" // 🔥 Adicionado
        ];
        fields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData
        });
        return user;
    }
}
exports.UserRepository = UserRepository;
