"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatUserSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.loginSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default.string().email("E-mail invalido"),
        password: zod_1.default.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    }),
});
exports.creatUserSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
        email: zod_1.default.string().email("E-mail inválido"),
        password: zod_1.default.string().min(6, "A senha deve ter no mínimo 6 caracteres")
    }), // <--- E feche a chave aqui
});
