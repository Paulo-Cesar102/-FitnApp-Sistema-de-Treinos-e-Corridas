"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymAuthService = void 0;
const prisma_1 = require("../database/prisma");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class GymAuthService {
    /**
     * Registra um novo usuário normal (USER) vinculado a uma academia existente
     * @param data Dados do usuário e ID/nome da academia
     */
    async registerUserInGym(data) {
        try {
            // Valida se a academia existe pelo ID ou nome
            const gym = await prisma_1.prisma.gym.findFirst({
                where: {
                    OR: [
                        { id: data.gymId },
                        { name: data.gymId }, // Permite procurar por nome também
                    ],
                },
            });
            if (!gym) {
                throw new Error("Academia não encontrada. Verifique o ID ou nome.");
            }
            // Verifica se o email já existe
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw new Error("Email já cadastrado");
            }
            // Hash da senha
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            // Cria o usuário vinculado à academia
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: client_1.Role.USER, // Usuário comum
                    gymId: gym.id, // Vincula à academia
                },
            });
            // Cria ranking do usuário na academia
            await prisma_1.prisma.gymRanking.create({
                data: {
                    position: 0, // Será atualizado depois
                    userId: user.id,
                    gymId: gym.id,
                },
            });
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gymId: gym.id,
                gymName: gym.name,
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Registra um novo proprietário de academia e cria a academia
     * @param data Dados do proprietário e da academia
     */
    async registerGymOwner(data) {
        try {
            // Verifica se o email já existe
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw new Error("Email já cadastrado");
            }
            // Verifica se o nome da academia já existe
            const existingGym = await prisma_1.prisma.gym.findFirst({
                where: { name: data.gymName },
            });
            if (existingGym) {
                throw new Error("Já existe uma academia com este nome");
            }
            // Hash da senha
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            // Cria o usuário como proprietário
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: client_1.Role.GYM_OWNER, // Proprietário de academia
                },
            });
            // Gera código de convite único
            const inviteCode = this.generateInviteCode();
            // Cria a academia
            const gym = await prisma_1.prisma.gym.create({
                data: {
                    name: data.gymName,
                    description: data.gymDescription,
                    address: data.gymAddress,
                    email: `${data.gymName.toLowerCase().replace(/\s+/g, "_")}@gym.com`,
                    pixKey: data.pixKey,
                    pixType: data.pixType,
                    inviteCode,
                    ownerId: user.id, // Proprietário
                },
            });
            // Vincula o proprietário à sua academia
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { gymId: gym.id },
            });
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gym: {
                    id: gym.id,
                    name: gym.name,
                    inviteCode: gym.inviteCode,
                },
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Faz login de usuário e retorna token JWT
     */
    async login(data) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
                include: {
                    gym: true,
                    _count: {
                        select: { completedWorkouts: true }
                    }
                },
            });
            if (!user) {
                throw new Error("Email ou senha incorretos");
            }
            // Verifica senha
            const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new Error("Email ou senha incorretos");
            }
            // Gera token JWT
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                gymId: user.gymId,
            }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
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
                    totalWorkoutsDone: user._count.completedWorkouts,
                    weightGoal: user.weightGoal,
                    height: user.height,
                    goalType: user.goalType,
                    experienceLevel: user.experienceLevel,
                    gymId: user.gymId,
                    gym: user.gym
                        ? {
                            id: user.gym.id,
                            name: user.gym.name,
                        }
                        : null,
                },
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Valida se uma academia existe
     */
    async validateGym(gymId) {
        try {
            const gym = await prisma_1.prisma.gym.findFirst({
                where: {
                    OR: [{ id: gymId }, { name: gymId }, { inviteCode: gymId }],
                },
            });
            if (!gym) {
                return null;
            }
            return {
                id: gym.id,
                name: gym.name,
                description: gym.description,
                address: gym.address,
                ownerId: gym.ownerId,
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Gera um código de convite único para a academia
     */
    generateInviteCode() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}
exports.GymAuthService = GymAuthService;
