"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymOwnerController = void 0;
const GymOwnerService_1 = require("../services/GymOwnerService");
/**
 * Controller para operações do proprietário de academia
 * Requer autenticação e verificação de permissão (GYM_OWNER)
 */
class GymOwnerController {
    gymOwnerService;
    constructor() {
        this.gymOwnerService = new GymOwnerService_1.GymOwnerService();
    }
    /**
     * Cadastra um novo personal na academia
     * POST /owner/personals
     * Body: { name, email, password, specialization, bio, certifications }
     */
    async createPersonal(req, res) {
        try {
            // O middleware auth deve adicionar o userId e role ao req
            const userId = req.userId;
            const role = req.role;
            if (role !== "GYM_OWNER") {
                return res.status(403).json({
                    error: "Apenas proprietários de academia podem cadastrar personals",
                });
            }
            const { name, email, password, specialization, bio, certifications } = req.body;
            const { gymId } = req.params;
            if (!name || !email || !password || !specialization) {
                return res.status(400).json({
                    error: "Nome, email, senha e especialização são obrigatórios",
                });
            }
            const personal = await this.gymOwnerService.createPersonal({
                name,
                email,
                password,
                specialization,
                bio,
                certifications,
                gymId,
                createdByOwnerId: userId,
            });
            return res.status(201).json({
                message: "Personal cadastrado com sucesso!",
                personal,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || "Erro ao cadastrar personal",
            });
        }
    }
    /**
     * Lista todos os personals da academia
     * GET /owner/:gymId/personals
     */
    async listPersonals(req, res) {
        try {
            const userId = req.userId;
            const { gymId } = req.params;
            const personals = await this.gymOwnerService.listGymPersonals(gymId, userId);
            return res.json({
                total: personals.length,
                personals,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || "Erro ao listar personals",
            });
        }
    }
    /**
     * Deleta um personal
     * DELETE /owner/:gymId/personals/:personalId
     */
    async deletePersonal(req, res) {
        try {
            const userId = req.userId;
            const { gymId, personalId } = req.params;
            const result = await this.gymOwnerService.deletePersonal(personalId, gymId, userId);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || "Erro ao deletar personal",
            });
        }
    }
    /**
     * Obtém estatísticas da academia
     * GET /owner/:gymId/stats
     */
    async getStats(req, res) {
        try {
            const userId = req.userId;
            const { gymId } = req.params;
            const stats = await this.gymOwnerService.getGymStats(gymId, userId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || "Erro ao obter estatísticas",
            });
        }
    }
}
exports.GymOwnerController = GymOwnerController;
