"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserRepository_1 = require("../repository/UserRepository");
const prisma_1 = require("../database/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    userRepository = new UserRepository_1.UserRepository();
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role
        }, "segredo-super-secreto", // Dica: use process.env.JWT_SECRET no futuro
        { expiresIn: "7d" });
        // --- ALTERAÇÃO AQUI: RETORNANDO O TOKEN + DADOS DO USUÁRIO ---
        const userData = user;
        const gymId = userData.role === "GYM_OWNER" ? userData.ownedGym?.id : userData.gymId;
        const gymName = userData.role === "GYM_OWNER" ? userData.ownedGym?.name : userData.gym?.name;
        // Busca inscrições com personals se for aluno
        const personalSubscriptions = await prisma_1.prisma.gymPersonalStudent.findMany({
            where: { studentId: user.id },
            select: { personalId: true }
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                level: user.level,
                xp: user.xp,
                streak: user.streak,
                onboardingCompleted: user.onboardingCompleted,
                totalWorkoutsDone: user.totalWorkoutsDone || 0,
                height: user.height,
                weightGoal: user.weightGoal,
                goalType: user.goalType,
                experienceLevel: user.experienceLevel,
                gymId,
                gymName,
                personalSubscriptions: personalSubscriptions.map(s => s.personalId)
            }
        };
    }
}
exports.AuthService = AuthService;
