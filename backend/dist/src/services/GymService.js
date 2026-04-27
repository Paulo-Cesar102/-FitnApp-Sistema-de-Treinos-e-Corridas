"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GymRepository_1 = __importDefault(require("../repository/GymRepository"));
class GymService {
    async linkStudent(userId, identifier) {
        const gym = await GymRepository_1.default.findByIdOrCode(identifier);
        if (!gym) {
            throw new Error("Academia Não encontrada");
        }
        const updateUser = await GymRepository_1.default.updateMember(userId, gym.id);
        return {
            message: `Seja Bem vindo a ${gym.name}!`,
            gymName: gym.name,
            user: updateUser
        };
    }
    async findGymByIdentifier(identifier) {
        const gym = await GymRepository_1.default.findByIdOrCode(identifier);
        return gym ? [gym] : [];
    }
    async registerGym(data) {
        const inviteCode = data.inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase();
        return await GymRepository_1.default.create({
            ...data,
            inviteCode
        });
    }
}
exports.default = new GymService();
