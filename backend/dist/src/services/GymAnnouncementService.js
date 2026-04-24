"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymAnnouncementService = void 0;
const GymAnnouncementRepository_1 = require("../repository/GymAnnouncementRepository");
class GymAnnouncementService {
    announcementRepository;
    constructor() {
        this.announcementRepository = new GymAnnouncementRepository_1.GymAnnouncementRepository();
    }
    async createAnnouncement(data) {
        // Validar prioridade
        if (data.priority && (data.priority < 0 || data.priority > 2)) {
            throw new Error("Prioridade deve ser entre 0 (normal) e 2 (urgente)");
        }
        return this.announcementRepository.create({
            title: data.title,
            content: data.content,
            gymId: data.gymId,
            createdBy: data.createdBy,
            imageUrl: data.imageUrl,
            priority: data.priority || 0,
        });
    }
    async getAnnouncementById(id) {
        return this.announcementRepository.findById(id);
    }
    async getGymAnnouncements(gymId, limit) {
        return this.announcementRepository.findByGym(gymId, limit);
    }
    async getGymAnnouncementsPaginated(gymId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [announcements, total] = await Promise.all([
            this.announcementRepository.findByGymPaginated(gymId, skip, pageSize),
            this.announcementRepository.countByGym(gymId),
        ]);
        return {
            announcements,
            pagination: {
                total,
                page,
                pageSize,
                pages: Math.ceil(total / pageSize),
            },
        };
    }
    async updateAnnouncement(id, data) {
        if (data.priority && (data.priority < 0 || data.priority > 2)) {
            throw new Error("Prioridade deve ser entre 0 (normal) e 2 (urgente)");
        }
        return this.announcementRepository.update(id, data);
    }
    async deleteAnnouncement(id) {
        return this.announcementRepository.delete(id);
    }
    async getUrgentAnnouncements(gymId) {
        return this.announcementRepository.getUrgentAnnouncements(gymId);
    }
}
exports.GymAnnouncementService = GymAnnouncementService;
