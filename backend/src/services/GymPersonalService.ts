import { GymPersonalRepository } from "../repository/GymPersonalRepository";
import { ChatRepository } from "../repository/ChatRepository";
import { UserRepository } from "../repository/UserRepository";
import { Role } from "@prisma/client";

interface CreatePersonalRequest {
  userId: string;
  gymId: string;
  specialization?: string;
  bio?: string;
  certifications?: string[];
}

interface AssignStudentRequest {
  personalId: string;
  studentId: string;
}

interface CreateSupportChatRequest {
  personalId: string;
  studentIds: string[];
  chatName: string;
}

export class GymPersonalService {
  private gymPersonalRepository: GymPersonalRepository;
  private chatRepository: ChatRepository;
  private userRepository: UserRepository;

  constructor() {
    this.gymPersonalRepository = new GymPersonalRepository();
    this.chatRepository = new ChatRepository();
    this.userRepository = new UserRepository();
  }

  async createPersonal(data: CreatePersonalRequest) {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se já é um personal
    const existingPersonal = await this.gymPersonalRepository.findByUserId(
      data.userId
    );
    if (existingPersonal) {
      throw new Error("Este usuário já é um personal");
    }

    // Criar o personal
    const personal = await this.gymPersonalRepository.create({
      userId: data.userId,
      gymId: data.gymId,
      specialization: data.specialization,
      bio: data.bio,
      certifications: data.certifications,
    });

    // Atualizar role do usuário para PERSONAL
    await this.userRepository.update(data.userId, {
      role: Role.PERSONAL,
    });

    return personal;
  }

  async getPersonalById(personalId: string) {
    return this.gymPersonalRepository.findById(personalId);
  }

  async getPersonalByUserId(userId: string) {
    return this.gymPersonalRepository.findByUserId(userId);
  }

  async getGymPersonals(gymId: string) {
    return this.gymPersonalRepository.findByGymId(gymId);
  }

  async updatePersonal(personalId: string, data: any) {
    return this.gymPersonalRepository.update(personalId, data);
  }

  async deletePersonal(personalId: string) {
    return this.gymPersonalRepository.delete(personalId);
  }

  async assignStudent(data: AssignStudentRequest) {
    // Verificar se o personal existe
    const personal = await this.gymPersonalRepository.findById(
      data.personalId
    );
    if (!personal) {
      throw new Error("Personal não encontrado");
    }

    // Verificar se o aluno existe
    const student = await this.userRepository.findById(data.studentId);
    if (!student) {
      throw new Error("Aluno não encontrado");
    }

    // 🔥 VERIFICAÇÃO DE 24 HORAS
    if (student.lastUnsubscribedAt) {
      const now = new Date();
      const lastUnsub = new Date(student.lastUnsubscribedAt);
      const diffTime = Math.abs(now.getTime() - lastUnsub.getTime());
      const diffHours = diffTime / (1000 * 60 * 60);

      if (diffHours < 24) {
        const remainingHours = Math.ceil(24 - diffHours);
        throw new Error(`Você só poderá se inscrever em um novo personal em ${remainingHours} horas.`);
      }
    }

    // Verificar se o aluno pertence à mesma academia do personal
    if (student.gymId !== personal.gymId) {
      throw new Error(
        "O aluno deve pertencer à mesma academia do personal"
      );
    }

    // Verificar se já está inscrito
    const existingStudents = await this.gymPersonalRepository.getStudents(data.personalId);
    if (existingStudents.some(s => s.studentId === data.studentId)) {
      throw new Error("Você já está inscrito com este personal");
    }

    return this.gymPersonalRepository.assignStudent(
      data.personalId,
      data.studentId
    );
  }

  async removeStudent(personalId: string, studentId: string) {
    const result = await this.gymPersonalRepository.removeStudent(personalId, studentId);
    
    // 🔥 ATUALIZA DATA DE DESINSCRIÇÃO DO ALUNO
    await this.userRepository.update(studentId, {
      lastUnsubscribedAt: new Date()
    });

    return result;
  }

  async getStudents(personalId: string) {
    return this.gymPersonalRepository.getStudents(personalId);
  }

  async createSupportChat(data: CreateSupportChatRequest) {
    // Criar um chat de grupo
    const chat = await this.chatRepository.createChat({
      isGroup: true,
      name: data.chatName,
      participantIds: [data.personalId, ...data.studentIds],
    });

    // Associar o chat ao personal
    const supportChat = await this.gymPersonalRepository.createSupportChat(
      data.personalId,
      chat.id
    );

    return supportChat;
  }

  async getSupportChats(personalId: string) {
    return this.gymPersonalRepository.getSupportChats(personalId);
  }
}
