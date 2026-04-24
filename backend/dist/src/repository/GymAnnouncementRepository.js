"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymAnnouncementRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class GymAnnouncementRepository {
    async create(data) {
        return prisma.gymAnnouncement.create({
            data: {
                title: data.title,
                content: data.content,
                gymId: data.gymId,
                createdBy: data.createdBy,
                imageUrl: data.imageUrl,
                priority: data.priority || 0,
            },
            include: {
                gym: true,
            },
        });
    }
    async findById(id) {
        return prisma.gymAnnouncement.findUnique({
            where: { id },
            include: {
                gym: true,
            },
        });
    }
    async findByGym(gymId, limit = 20) {
        return prisma.gymAnnouncement.findMany({
            where: { gymId },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
            take: limit,
            include: {
                gym: true,
            },
        });
    }
    async findByGymPaginated(gymId, skip = 0, take = 10) {
        return prisma.gymAnnouncement.findMany({
            where: { gymId },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
            skip,
            take,
            include: {
                gym: true,
            },
        });
    }
    async update(id, data) {
        return prisma.gymAnnouncement.update({
            where: { id },
            data,
            include: {
                gym: true,
            },
        });
    }
    async delete(id) {
        return prisma.gymAnnouncement.delete({
            where: { id },
        });
    }
    async getUrgentAnnouncements(gymId) {
        return prisma.gymAnnouncement.findMany({
            where: {
                gymId,
                priority: {
                    gte: 2,
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                gym: true,
            },
        });
    }
    async countByGym(gymId) {
        return prisma.gymAnnouncement.count({
            where: { gymId },
        });
    }
}
exports.GymAnnouncementRepository = GymAnnouncementRepository;
