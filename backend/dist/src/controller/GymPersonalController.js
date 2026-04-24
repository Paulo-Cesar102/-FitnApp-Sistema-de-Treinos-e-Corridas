"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymPersonalController = void 0;
const GymPersonalService_1 = require("../services/GymPersonalService");
class GymPersonalController {
    gymPersonalService;
    constructor() {
        this.gymPersonalService = new GymPersonalService_1.GymPersonalService();
    }
    async createPersonal(req, res) {
        try {
            const { userId, gymId, specialization, bio, certifications } = req.body;
            if (!userId || !gymId) {
                return res
                    .status(400)
                    .json({ error: "userId e gymId são obrigatórios" });
            }
            const personal = await this.gymPersonalService.createPersonal({
                userId,
                gymId,
                specialization,
                bio,
                certifications,
            });
            return res.status(201).json(personal);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getPersonalById(req, res) {
        try {
            const { personalId } = req.params;
            const personal = await this.gymPersonalService.getPersonalById(personalId);
            if (!personal) {
                return res.status(404).json({ error: "Personal não encontrado" });
            }
            return res.json(personal);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getPersonalByUserId(req, res) {
        try {
            const { userId } = req.params;
            const personal = await this.gymPersonalService.getPersonalByUserId(userId);
            if (!personal) {
                return res.status(404).json({ error: "Personal não encontrado" });
            }
            return res.json(personal);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getGymPersonals(req, res) {
        try {
            const { gymId } = req.params;
            const personals = await this.gymPersonalService.getGymPersonals(gymId);
            return res.json(personals);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async updatePersonal(req, res) {
        try {
            const { personalId } = req.params;
            const { specialization, bio, certifications } = req.body;
            const personal = await this.gymPersonalService.updatePersonal(personalId, {
                specialization,
                bio,
                certifications,
            });
            return res.json(personal);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async deletePersonal(req, res) {
        try {
            const { personalId } = req.params;
            await this.gymPersonalService.deletePersonal(personalId);
            return res.json({ message: "Personal deletado com sucesso" });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async assignStudent(req, res) {
        try {
            const { personalId, studentId } = req.body;
            if (!personalId || !studentId) {
                return res.status(400).json({
                    error: "personalId e studentId são obrigatórios",
                });
            }
            const assignment = await this.gymPersonalService.assignStudent({
                personalId,
                studentId,
            });
            return res.status(201).json(assignment);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async removeStudent(req, res) {
        try {
            const { personalId, studentId } = req.params;
            await this.gymPersonalService.removeStudent(personalId, studentId);
            return res.json({ message: "Aluno removido com sucesso" });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getStudents(req, res) {
        try {
            const { personalId } = req.params;
            const students = await this.gymPersonalService.getStudents(personalId);
            return res.json(students);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async createSupportChat(req, res) {
        try {
            const { personalId, studentIds, chatName } = req.body;
            if (!personalId || !studentIds || !chatName) {
                return res.status(400).json({
                    error: "personalId, studentIds e chatName são obrigatórios",
                });
            }
            const supportChat = await this.gymPersonalService.createSupportChat({
                personalId,
                studentIds,
                chatName,
            });
            return res.status(201).json(supportChat);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getSupportChats(req, res) {
        try {
            const { personalId } = req.params;
            const chats = await this.gymPersonalService.getSupportChats(personalId);
            return res.json(chats);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.GymPersonalController = GymPersonalController;
