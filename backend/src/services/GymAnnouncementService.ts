import { GymAnnouncementRepository } from "../repository/GymAnnouncementRepository";
import { NotificationRepository } from "../repository/NotificationRepository";
import { prisma } from "../database/prisma";
import { io } from "../../server";

interface CreateAnnouncementRequest {
  title: string;
  content: string;
  gymId: string;
  createdBy: string;
  imageUrl?: string;
  priority?: number;
}

interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  imageUrl?: string;
  priority?: number;
}

export class GymAnnouncementService {
  private announcementRepository: GymAnnouncementRepository;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.announcementRepository = new GymAnnouncementRepository();
    this.notificationRepository = new NotificationRepository();
  }

  async createAnnouncement(data: CreateAnnouncementRequest) {
    // Validar prioridade
    if (data.priority && (data.priority < 0 || data.priority > 2)) {
      throw new Error(
        "Prioridade deve ser entre 0 (normal) e 2 (urgente)"
      );
    }

    const announcement = await this.announcementRepository.create({
      title: data.title,
      content: data.content,
      gymId: data.gymId,
      createdBy: data.createdBy,
      imageUrl: data.imageUrl,
      priority: data.priority || 0,
    });

    // 🔥 Notificar via Socket
    io.to(`gym_${data.gymId}`).emit("announcement_updated", { gymId: data.gymId });

    // 🔥 Criar Notificações para todos os alunos da academia
    try {
      const students = await prisma.user.findMany({
        where: { gymId: data.gymId, role: "USER" },
        select: { id: true }
      });

      // Cria notificações em lote (ou uma por uma se preferir usar o repository)
      const notificationPromises = students.map(student => 
        this.notificationRepository.create({
          userId: student.id,
          title: `Aviso: ${data.title}`,
          message: data.content.substring(0, 100) + (data.content.length > 100 ? "..." : ""),
          type: "GYM_ANNOUNCEMENT"
        })
      );
      
      await Promise.all(notificationPromises);
    } catch (err) {
      console.error("Erro ao gerar notificações de aviso:", err);
    }

    return announcement;
  }

  async getAnnouncementById(id: string) {
    return this.announcementRepository.findById(id);
  }

  async getGymAnnouncements(gymId: string, limit?: number) {
    return this.announcementRepository.findByGym(gymId, limit);
  }

  async getGymAnnouncementsPaginated(
    gymId: string,
    page: number = 1,
    pageSize: number = 10
  ) {
    const skip = (page - 1) * pageSize;

    const [announcements, total] = await Promise.all([
      this.announcementRepository.findByGymPaginated(
        gymId,
        skip,
        pageSize
      ),
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

  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest) {
    if (data.priority && (data.priority < 0 || data.priority > 2)) {
      throw new Error(
        "Prioridade deve ser entre 0 (normal) e 2 (urgente)"
      );
    }

    const announcement = await this.announcementRepository.update(id, data);
    
    // 🔥 Notificar via Socket
    if (announcement.gymId) {
      io.to(`gym_${announcement.gymId}`).emit("announcement_updated", { gymId: announcement.gymId });
    }

    return announcement;
  }

  async deleteAnnouncement(id: string) {
    const announcement = await this.announcementRepository.findById(id);
    const result = await this.announcementRepository.delete(id);

    // 🔥 Notificar via Socket
    if (announcement?.gymId) {
      io.to(`gym_${announcement.gymId}`).emit("announcement_updated", { gymId: announcement.gymId });
    }

    return result;
  }

  async getUrgentAnnouncements(gymId: string) {
    return this.announcementRepository.getUrgentAnnouncements(gymId);
  }
}
