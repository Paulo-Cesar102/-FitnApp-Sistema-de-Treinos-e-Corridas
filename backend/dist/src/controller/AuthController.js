"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
class AuthController {
    authService = new AuthService_1.AuthService();
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // O 'result' agora contém { token, user }
            const result = await this.authService.login(email, password);
            return res.json(result);
        }
        catch (error) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }
}
exports.AuthController = AuthController;
