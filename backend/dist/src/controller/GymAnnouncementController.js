"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymAnnouncementController = void 0;
const GymAnnouncementService_1 = require("../services/GymAnnouncementService");
class GymAnnouncementController {
    announcementService;
    constructor() {
        this.announcementService = new GymAnnouncementService_1.GymAnnouncementService();
    }
    async createAnnouncement(req, res) {
        try {
            const { title, content, gymId, imageUrl, priority, isUrgent } = req.body;
            const createdBy = req.userId || req.user?.id;
            if (!title || !content || !gymId || !createdBy) {
                console.error("Faltando campos obrigatórios para aviso:", { title, content, gymId, createdBy });
                return res.status(400).json({
                    error: "title, content, gymId e createdBy são obrigatórios",
                });
            }
            // Mapeia isUrgent para priority se priority não for enviado
            let finalPriority = priority;
            if (finalPriority === undefined && isUrgent !== undefined) {
                finalPriority = isUrgent ? 2 : 0;
            }
            const announcement = await this.announcementService.createAnnouncement({
                title,
                content,
                gymId,
                createdBy,
                imageUrl,
                priority: finalPriority || 0,
            });
            return res.status(201).json(announcement);
        }
        catch (error) {
            console.error("Erro ao criar aviso:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async getAnnouncementById(req, res) {
        try {
            const { announcementId } = req.params;
            const announcement = await this.announcementService.getAnnouncementById(announcementId);
            if (!announcement) {
                return res
                    .status(404)
                    .json({ error: "Aviso não encontrado" });
            }
            return res.json(announcement);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getGymAnnouncements(req, res) {
        try {
            const { gymId } = req.params;
            const { page = 1, pageSize = 10 } = req.query;
            const result = await this.announcementService.getGymAnnouncementsPaginated(gymId, parseInt(page), parseInt(pageSize));
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async updateAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            const { title, content, imageUrl, priority } = req.body;
            const announcement = await this.announcementService.updateAnnouncement(announcementId, {
                title,
                content,
                imageUrl,
                priority,
            });
            return res.json(announcement);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async deleteAnnouncement(req, res) {
        try {
            const { announcementId } = req.params;
            await this.announcementService.deleteAnnouncement(announcementId);
            return res.json({
                message: "Aviso deletado com sucesso",
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async getUrgentAnnouncements(req, res) {
        try {
            const { gymId } = req.params;
            const announcements = await this.announcementService.getUrgentAnnouncements(gymId);
            return res.json(announcements);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.GymAnnouncementController = GymAnnouncementController;
