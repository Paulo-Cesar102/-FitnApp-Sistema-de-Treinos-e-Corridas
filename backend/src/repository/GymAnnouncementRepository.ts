import { prisma } from "../database/prisma";

interface CreateAnnouncementInput {
  title: string;
  content: string;
  gymId: string;
  createdBy: string;
  imageUrl?: string;
  priority?: number;
}

interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  imageUrl?: string;
  priority?: number;
}

export class GymAnnouncementRepository {
  async create(data: CreateAnnouncementInput) {
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

  async findById(id: string) {
    return prisma.gymAnnouncement.findUnique({
      where: { id },
      include: {
        gym: true,
      },
    });
  }

  async findByGym(gymId: string, limit: number = 20) {
    return prisma.gymAnnouncement.findMany({
      where: { gymId },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        gym: true,
      },
    });
  }

  async findByGymPaginated(
    gymId: string,
    skip: number = 0,
    take: number = 10
  ) {
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

  async update(id: string, data: UpdateAnnouncementInput) {
    return prisma.gymAnnouncement.update({
      where: { id },
      data,
      include: {
        gym: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.gymAnnouncement.delete({
      where: { id },
    });
  }

  async getUrgentAnnouncements(gymId: string) {
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

  async countByGym(gymId: string) {
    return prisma.gymAnnouncement.count({
      where: { gymId },
    });
  }
}
