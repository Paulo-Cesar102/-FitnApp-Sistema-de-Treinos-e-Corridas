import { prisma } from "../database/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

interface CreatePersonalRequest {
  name: string;
  email: string;
  password: string;
  specialization: string; // Ex: "Musculação", "CrossFit"
  bio?: string;
  certifications?: string[];
}

interface CreatePersonalByOwnerRequest extends CreatePersonalRequest {
  gymId: string;
  createdByOwnerId: string; // ID do proprietário que está criando
}

export class GymOwnerService {
  /**
   * Propriedades que só o proprietário pode acessar
   */

  /**
   * Verifica se um email já está cadastrado no sistema
   */
  async checkEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return user;
  }

  /**
   * Cadastra um novo personal na academia
   * Apenas o proprietário pode fazer isso
   */
  async createPersonal(data: CreatePersonalByOwnerRequest) {
    try {
      console.log("Iniciando criação de personal:", {
        gymId: data.gymId,
        ownerId: data.createdByOwnerId,
        email: data.email
      });

      // Valida se o proprietário é dono da academia
      const gym = await prisma.gym.findUnique({
        where: { id: data.gymId },
      });

      if (!gym) {
        console.error("Academia não encontrada:", data.gymId);
        throw new Error("Academia não encontrada");
      }

      if (gym.ownerId !== data.createdByOwnerId) {
        console.error("Permissão negada. Owner da gym:", gym.ownerId, "User tentando:", data.createdByOwnerId);
        throw new Error(
          "Você não tem permissão para cadastrar personals nesta academia"
        );
      }

      // Verifica se o email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      let user;

      if (existingUser) {
        console.log("Usuário já existe. Promovendo a PERSONAL:", existingUser.email);
        
        // Se o usuário já existe, atualiza o cargo para PERSONAL e vincula à academia
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: Role.PERSONAL,
            gymId: data.gymId
          }
        });
        
        // Verifica se já tem perfil de personal
        const existingPersonal = await prisma.gymPersonal.findUnique({
          where: { userId: existingUser.id }
        });
        
        if (!existingPersonal) {
          await prisma.gymPersonal.create({
            data: {
              userId: existingUser.id,
              gymId: data.gymId,
              specialization: data.specialization,
              bio: data.bio || "",
              certifications: data.certifications || []
            }
          });
        } else {
          // Atualiza o personal existente para a nova academia
          await prisma.gymPersonal.update({
            where: { id: existingPersonal.id },
            data: {
              gymId: data.gymId,
              specialization: data.specialization,
              bio: data.bio || existingPersonal.bio,
            }
          });
        }
      } else {
        // Hash da senha
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Cria o usuário como PERSONAL
        user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: Role.PERSONAL,
            gymId: data.gymId, // Vincula à academia
          },
        });

        // Cria o perfil do personal
        await prisma.gymPersonal.create({
          data: {
            userId: user.id,
            gymId: data.gymId,
            specialization: data.specialization,
            bio: data.bio || "",
            certifications: data.certifications || [],
          },
        });
      }

      // Busca o personal criado/atualizado para retornar
      const finalPersonal = await prisma.gymPersonal.findUnique({
        where: { userId: user.id },
        include: { user: true }
      });

      if (!finalPersonal) throw new Error("Erro ao recuperar perfil do personal");

      return {
        id: finalPersonal.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        specialization: finalPersonal.specialization,
        bio: finalPersonal.bio,
        certifications: finalPersonal.certifications,
        createdAt: finalPersonal.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lista todos os personals de uma academia
   */
  async listGymPersonals(gymId: string, ownerIdValidation: string) {
    try {
      // Valida permissão
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      });

      if (!gym || gym.ownerId !== ownerIdValidation) {
        throw new Error(
          "Você não tem permissão para ver os personals desta academia"
        );
      }

      const personals = await prisma.gymPersonal.findMany({
        where: { gymId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              xp: true,
            },
          },
          students: true,
        },
      });

      return personals.map(p => ({
        id: p.id,
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        specialization: p.specialization,
        bio: p.bio,
        certifications: p.certifications,
        createdAt: p.createdAt,
        students: p.students
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deleta um personal (apenas o proprietário)
   */
  async deletePersonal(
    personalId: string,
    gymId: string,
    ownerIdValidation: string
  ) {
    try {
      // Valida permissão
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      });

      if (!gym || gym.ownerId !== ownerIdValidation) {
        throw new Error(
          "Você não tem permissão para deletar personals desta academia"
        );
      }

      // Busca o personal
      const personal = await prisma.gymPersonal.findUnique({
        where: { id: personalId },
      });

      if (!personal || personal.gymId !== gymId) {
        throw new Error("Personal não encontrado");
      }

      // Deleta o personal e o usuário associado
      await prisma.gymPersonal.delete({
        where: { id: personalId },
      });

      // Deleta o usuário
      await prisma.user.delete({
        where: { id: personal.userId },
      });

      return { message: "Personal deletado com sucesso" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lista todos os membros da academia (alunos)
   */
  async listGymMembers(gymId: string, userIdValidation: string, search?: string) {
    try {
      const userRequester = await prisma.user.findUnique({
        where: { id: userIdValidation },
        select: { role: true, gymId: true }
      });

      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      });

      if (!gym) throw new Error("Academia não encontrada");

      // Permite se for o dono, se for admin, ou se for personal daquela academia
      const isOwner = gym.ownerId === userIdValidation;
      const isAdmin = userRequester?.role === Role.ADMIN;
      const isPersonalOfGym = userRequester?.role === Role.PERSONAL && userRequester?.gymId === gymId;

      if (!isOwner && !isAdmin && !isPersonalOfGym) {
        throw new Error("Sem permissão para ver membros desta academia");
      }

      const members = await prisma.user.findMany({
        where: {
          gymId,
          role: Role.USER, // Apenas alunos, não personals/admin
          OR: search ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ] : undefined
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          level: true,
          xp: true,
          streak: true,
          lastActivityDate: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' }
      });

      return members;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtém estatísticas da academia
   */
  async getGymStats(gymId: string, ownerIdValidation: string) {
    try {
      // Valida permissão
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      });

      if (!gym || gym.ownerId !== ownerIdValidation) {
        throw new Error(
          "Você não tem permissão para ver as estatísticas desta academia"
        );
      }

      const totalMembers = await prisma.user.count({
        where: { gymId, role: Role.USER },
      });

      const totalPersonals = await prisma.gymPersonal.count({
        where: { gymId },
      });

      const todayCheckIns = await prisma.checkIn.count({
        where: {
          gymId,
          checkedInAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      });

      const topRanking = await prisma.gymRanking.findMany({
        where: { gymId },
        orderBy: { position: "asc" },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              level: true,
            },
          },
        },
      });

      return {
        gym: {
          id: gym.id,
          name: gym.name,
          inviteCode: gym.inviteCode,
        },
        stats: {
          totalMembers,
          totalPersonals,
          todayCheckIns,
        },
        topRanking,
      };
    } catch (error) {
      throw error;
    }
  }
}
