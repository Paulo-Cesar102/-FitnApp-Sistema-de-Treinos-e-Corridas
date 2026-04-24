"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GymService_1 = __importDefault(require("../services/GymService"));
class GymController {
    async join(req, res) {
        const { identifier } = req.body;
        const userId = req.user?.id;
        try {
            if (!identifier) {
                return res.status(400).json({ message: "Identificador de academia é Obrigatorio!" });
            }
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado." });
            }
            // Agora o TS sabe que userId é 100% string
            const result = await GymService_1.default.linkStudent(userId, identifier);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async search(req, res) {
        const { name } = req.query;
        try {
            const gyms = await GymService_1.default.searchGyms(name || "");
            return res.status(200).json(gyms);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async create(req, res) {
        try {
            const gym = GymService_1.default.registerGym(req.body);
            return res.status(201).json(gym);
        }
        catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }
}
exports.default = GymController;
