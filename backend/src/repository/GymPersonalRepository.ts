import { prisma } from "../database/prisma";

interface CreateGymPersonalInput {
  userId: string;
  gymId: string;
  specialization?: string;
  bio?: string;
  certifications?: string[];
}

interface UpdateGymPersonalInput {
  specialization?: string;
  bio?: string;
  certifications?: string[];
}

export class GymPersonalRepository {
  async create(data: CreateGymPersonalInput) {
    return prisma.gymPersonal.create({
      data: {
        userId: data.userId,
        gymId: data.gymId,
        specialization: data.specialization,
        bio: data.bio,
        certifications: data.certifications || [],
      },
      include: {
        user: true,
        gym: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.gymPersonal.findUnique({
      where: { id },
      include: {
        user: true,
        gym: true,
        students: {
          include: {
            student: true,
          },
        },
        supportChats: {
          include: {
            chat: {
              include: {
                messages: true,
                participants: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.gymPersonal.findUnique({
      where: { userId },
      include: {
        user: true,
        gym: true,
        students: {
          include: {
            student: true,
          },
        },
        supportChats: true,
      },
    });
  }

  async findByGymId(gymId: string) {
    return prisma.gymPersonal.findMany({
      where: { gymId },
      include: {
        user: true,
        gym: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateGymPersonalInput) {
    return prisma.gymPersonal.update({
      where: { id },
      data,
      include: {
        user: true,
        gym: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.gymPersonal.delete({
      where: { id },
    });
  }

  // Adicionar aluno ao personal
  async assignStudent(personalId: string, studentId: string) {
    return prisma.gymPersonalStudent.create({
      data: {
        personalId,
        studentId,
      },
      include: {
        personal: true,
        student: true,
      },
    });
  }

  // Remover aluno
  async removeStudent(personalId: string, studentId: string) {
    return prisma.gymPersonalStudent.delete({
      where: {
        personalId_studentId: {
          personalId,
          studentId,
        },
      },
    });
  }

  // Obter alunos de um personal
  async getStudents(personalId: string) {
    return prisma.gymPersonalStudent.findMany({
      where: { personalId },
      include: {
        student: true,
      },
    });
  }

  // Obter personals de um aluno
  async getPersonalsByStudentId(studentId: string) {
    return prisma.gymPersonalStudent.findMany({
      where: { studentId },
      include: {
        personal: {
          include: {
            user: true
          }
        },
      },
    });
  }

  // Criar chat de suporte
  async createSupportChat(personalId: string, chatId: string) {
    return prisma.gymPersonalChat.create({
      data: {
        personalId,
        chatId,
      },
      include: {
        personal: true,
        chat: {
          include: {
            messages: true,
            participants: true,
          },
        },
      },
    });
  }

  // Obter chats de suporte
  async getSupportChats(personalId: string) {
    return prisma.gymPersonalChat.findMany({
      where: { personalId },
      include: {
        chat: {
          include: {
            messages: true,
            participants: true,
          },
        },
      },
    });
  }
}
