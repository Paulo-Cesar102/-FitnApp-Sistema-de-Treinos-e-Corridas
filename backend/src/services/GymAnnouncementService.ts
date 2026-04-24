import { GymAnnouncementRepository } from "../repository/GymAnnouncementRepository";

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

  constructor() {
    this.announcementRepository = new GymAnnouncementRepository();
  }

  async createAnnouncement(data: CreateAnnouncementRequest) {
    // Validar prioridade
    if (data.priority && (data.priority < 0 || data.priority > 2)) {
      throw new Error(
        "Prioridade deve ser entre 0 (normal) e 2 (urgente)"
      );
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

    return this.announcementRepository.update(id, data);
  }

  async deleteAnnouncement(id: string) {
    return this.announcementRepository.delete(id);
  }

  async getUrgentAnnouncements(gymId: string) {
    return this.announcementRepository.getUrgentAnnouncements(gymId);
  }
}
