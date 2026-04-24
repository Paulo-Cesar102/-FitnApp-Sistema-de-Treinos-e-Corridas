"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserRepository_1 = require("../repository/UserRepository");
class UserService {
    userRepository = new UserRepository_1.UserRepository();
    async create(data) {
        const userExists = await this.userRepository.findByEmail(data.email);
        if (userExists) {
            throw new Error("Email já cadastrado");
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword
        });
        return user;
    }
    async findAll() {
        return this.userRepository.findAll();
    }
    async findById(id) {
        return this.userRepository.findById(id);
    }
    async delete(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error("Usuário não existe");
        }
        await this.userRepository.delete(id);
    }
    async update(id, data) {
        return this.userRepository.update(id, data);
    }
}
exports.UserService = UserService;
