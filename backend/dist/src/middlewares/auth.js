"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "Token não fornecido"
        });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
        return res.status(401).json({
            message: "Token mal formatado"
        });
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({
            message: "Formato inválido"
        });
    }
    try {
        const secret = process.env.JWT_SECRET || "segredo-super-secreto";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // 🔥 salva no request
        req.user = {
            id: decoded.id,
            role: decoded.role,
            gymId: decoded.gymId
        };
        // Para compatibilidade com controllers que usam req.userId ou req.role diretamente
        req.userId = decoded.id;
        req.role = decoded.role;
        req.gymId = decoded.gymId;
        console.log("Usuário autenticado:", req.user);
        return next();
    }
    catch (err) {
        return res.status(401).json({
            message: "Token inválido"
        });
    }
}
