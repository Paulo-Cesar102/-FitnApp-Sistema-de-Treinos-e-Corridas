"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymPersonalRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class GymPersonalRepository {
    async create(data) {
        return prisma.gymPersonal.create({
            data: {
                userId: data.userId,
                gymId: data.gymId,
                specialization: data.specialization,
                bio: data.bio,
                certifications: data.certifications || [],
            },
            include: {
                user: true,
                gym: true,
                students: {
                    include: {
                        student: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return prisma.gymPersonal.findUnique({
            where: { id },
            include: {
                user: true,
                gym: true,
                students: {
                    include: {
                        student: true,
                    },
                },
                supportChats: {
                    include: {
                        chat: {
                            include: {
                                messages: true,
                                participants: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findByUserId(userId) {
        return prisma.gymPersonal.findUnique({
            where: { userId },
            include: {
                user: true,
                gym: true,
                students: {
                    include: {
                        student: true,
                    },
                },
                supportChats: true,
            },
        });
    }
    async findByGymId(gymId) {
        return prisma.gymPersonal.findMany({
            where: { gymId },
            include: {
                user: true,
                gym: true,
                students: {
                    include: {
                        student: true,
                    },
                },
            },
        });
    }
    async update(id, data) {
        return prisma.gymPersonal.update({
            where: { id },
            data,
            include: {
                user: true,
                gym: true,
                students: {
                    include: {
                        student: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        return prisma.gymPersonal.delete({
            where: { id },
        });
    }
    // Adicionar aluno ao personal
    async assignStudent(personalId, studentId) {
        return prisma.gymPersonalStudent.create({
            data: {
                personalId,
                studentId,
            },
            include: {
                personal: true,
                student: true,
            },
        });
    }
    // Remover aluno
    async removeStudent(personalId, studentId) {
        return prisma.gymPersonalStudent.delete({
            where: {
                personalId_studentId: {
                    personalId,
                    studentId,
                },
            },
        });
    }
    // Obter alunos de um personal
    async getStudents(personalId) {
        return prisma.gymPersonalStudent.findMany({
            where: { personalId },
            include: {
                student: true,
            },
        });
    }
    // Criar chat de suporte
    async createSupportChat(personalId, chatId) {
        return prisma.gymPersonalChat.create({
            data: {
                personalId,
                chatId,
            },
            include: {
                personal: true,
                chat: {
                    include: {
                        messages: true,
                        participants: true,
                    },
                },
            },
        });
    }
    // Obter chats de suporte
    async getSupportChats(personalId) {
        return prisma.gymPersonalChat.findMany({
            where: { personalId },
            include: {
                chat: {
                    include: {
                        messages: true,
                        participants: true,
                    },
                },
            },
        });
    }
}
exports.GymPersonalRepository = GymPersonalRepository;
