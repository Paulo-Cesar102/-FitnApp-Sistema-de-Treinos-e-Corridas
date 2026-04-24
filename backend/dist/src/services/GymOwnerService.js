"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymOwnerService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
class GymOwnerService {
    /**
     * Propriedades que só o proprietário pode acessar
     */
    /**
     * Cadastra um novo personal na academia
     * Apenas o proprietário pode fazer isso
     */
    async createPersonal(data) {
        try {
            // Valida se o proprietário é dono da academia
            const gym = await prisma.gym.findUnique({
                where: { id: data.gymId },
            });
            if (!gym || gym.ownerId !== data.createdByOwnerId) {
                throw new Error("Você não tem permissão para cadastrar personals nesta academia");
            }
            // Verifica se o email já existe
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw new Error("Email já cadastrado");
            }
            // Hash da senha
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            // Cria o usuário como PERSONAL
            const user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: client_1.Role.PERSONAL,
                    gymId: data.gymId, // Vincula à academia
                },
            });
            // Cria o perfil do personal
            const personal = await prisma.gymPersonal.create({
                data: {
                    userId: user.id,
                    gymId: data.gymId,
                    specialization: data.specialization,
                    bio: data.bio || "",
                    certifications: data.certifications || [],
                },
            });
            return {
                id: personal.id,
                userId: user.id,
                name: user.name,
                email: user.email,
                specialization: personal.specialization,
                bio: personal.bio,
                certifications: personal.certifications,
                createdAt: personal.createdAt,
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Lista todos os personals de uma academia
     */
    async listGymPersonals(gymId, ownerIdValidation) {
        try {
            // Valida permissão
            const gym = await prisma.gym.findUnique({
                where: { id: gymId },
            });
            if (!gym || gym.ownerId !== ownerIdValidation) {
                throw new Error("Você não tem permissão para ver os personals desta academia");
            }
            const personals = await prisma.gymPersonal.findMany({
                where: { gymId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            level: true,
                            xp: true,
                        },
                    },
                    students: true,
                },
            });
            return personals;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Deleta um personal (apenas o proprietário)
     */
    async deletePersonal(personalId, gymId, ownerIdValidation) {
        try {
            // Valida permissão
            const gym = await prisma.gym.findUnique({
                where: { id: gymId },
            });
            if (!gym || gym.ownerId !== ownerIdValidation) {
                throw new Error("Você não tem permissão para deletar personals desta academia");
            }
            // Busca o personal
            const personal = await prisma.gymPersonal.findUnique({
                where: { id: personalId },
            });
            if (!personal || personal.gymId !== gymId) {
                throw new Error("Personal não encontrado");
            }
            // Deleta o personal e o usuário associado
            await prisma.gymPersonal.delete({
                where: { id: personalId },
            });
            // Deleta o usuário
            await prisma.user.delete({
                where: { id: personal.userId },
            });
            return { message: "Personal deletado com sucesso" };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Obtém estatísticas da academia
     */
    async getGymStats(gymId, ownerIdValidation) {
        try {
            // Valida permissão
            const gym = await prisma.gym.findUnique({
                where: { id: gymId },
            });
            if (!gym || gym.ownerId !== ownerIdValidation) {
                throw new Error("Você não tem permissão para ver as estatísticas desta academia");
            }
            const totalMembers = await prisma.user.count({
                where: { gymId },
            });
            const totalPersonals = await prisma.gymPersonal.count({
                where: { gymId },
            });
            const todayCheckIns = await prisma.checkIn.count({
                where: {
                    gymId,
                    checkedInAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lte: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                },
            });
            const topRanking = await prisma.gymRanking.findMany({
                where: { gymId },
                orderBy: { position: "asc" },
                take: 5,
                include: {
                    user: {
                        select: {
                            name: true,
                            level: true,
                        },
                    },
                },
            });
            return {
                gym: {
                    id: gym.id,
                    name: gym.name,
                    inviteCode: gym.inviteCode,
                },
                stats: {
                    totalMembers,
                    totalPersonals,
                    todayCheckIns,
                },
                topRanking,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.GymOwnerService = GymOwnerService;
