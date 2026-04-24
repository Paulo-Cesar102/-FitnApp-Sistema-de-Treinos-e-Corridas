"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserRepository_1 = require("../repository/UserRepository");
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
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                level: user.level,
                xp: user.xp,
                streak: user.streak
                // Não envie a senha (password) aqui por segurança!
            }
        };
    }
}
exports.AuthService = AuthService;
