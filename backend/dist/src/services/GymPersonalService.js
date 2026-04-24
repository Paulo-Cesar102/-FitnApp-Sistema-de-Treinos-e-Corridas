"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymPersonalService = void 0;
const GymPersonalRepository_1 = require("../repository/GymPersonalRepository");
const ChatRepository_1 = require("../repository/ChatRepository");
const UserRepository_1 = require("../repository/UserRepository");
const client_1 = require("@prisma/client");
class GymPersonalService {
    gymPersonalRepository;
    chatRepository;
    userRepository;
    constructor() {
        this.gymPersonalRepository = new GymPersonalRepository_1.GymPersonalRepository();
        this.chatRepository = new ChatRepository_1.ChatRepository();
        this.userRepository = new UserRepository_1.UserRepository();
    }
    async createPersonal(data) {
        // Verificar se o usuário existe
        const user = await this.userRepository.findById(data.userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        // Verificar se já é um personal
        const existingPersonal = await this.gymPersonalRepository.findByUserId(data.userId);
        if (existingPersonal) {
            throw new Error("Este usuário já é um personal");
        }
        // Criar o personal
        const personal = await this.gymPersonalRepository.create({
            userId: data.userId,
            gymId: data.gymId,
            specialization: data.specialization,
            bio: data.bio,
            certifications: data.certifications,
        });
        // Atualizar role do usuário para PERSONAL
        await this.userRepository.update(data.userId, {
            role: client_1.Role.PERSONAL,
        });
        return personal;
    }
    async getPersonalById(personalId) {
        return this.gymPersonalRepository.findById(personalId);
    }
    async getPersonalByUserId(userId) {
        return this.gymPersonalRepository.findByUserId(userId);
    }
    async getGymPersonals(gymId) {
        return this.gymPersonalRepository.findByGymId(gymId);
    }
    async updatePersonal(personalId, data) {
        return this.gymPersonalRepository.update(personalId, data);
    }
    async deletePersonal(personalId) {
        return this.gymPersonalRepository.delete(personalId);
    }
    async assignStudent(data) {
        // Verificar se o personal existe
        const personal = await this.gymPersonalRepository.findById(data.personalId);
        if (!personal) {
            throw new Error("Personal não encontrado");
        }
        // Verificar se o aluno existe
        const student = await this.userRepository.findById(data.studentId);
        if (!student) {
            throw new Error("Aluno não encontrado");
        }
        // Verificar se o aluno pertence à mesma academia
        if (student.gymId !== personal.gymId) {
            throw new Error("O aluno deve pertencer à mesma academia do personal");
        }
        return this.gymPersonalRepository.assignStudent(data.personalId, data.studentId);
    }
    async removeStudent(personalId, studentId) {
        return this.gymPersonalRepository.removeStudent(personalId, studentId);
    }
    async getStudents(personalId) {
        return this.gymPersonalRepository.getStudents(personalId);
    }
    async createSupportChat(data) {
        // Criar um chat de grupo
        const chat = await this.chatRepository.createChat({
            isGroup: true,
            name: data.chatName,
            participantIds: [data.personalId, ...data.studentIds],
        });
        // Associar o chat ao personal
        const supportChat = await this.gymPersonalRepository.createSupportChat(data.personalId, chat.id);
        return supportChat;
    }
    async getSupportChats(personalId) {
        return this.gymPersonalRepository.getSupportChats(personalId);
    }
}
exports.GymPersonalService = GymPersonalService;
