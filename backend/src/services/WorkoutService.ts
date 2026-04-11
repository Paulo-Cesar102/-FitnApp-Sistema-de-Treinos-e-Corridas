import { prisma } from "../database/prisma";
import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";
import { WorkoutRepository } from "../repository/WorkoutRepository";

export class WorkoutService {
  private workoutRepository = new WorkoutRepository();

  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
    if (!data.name) {
      throw new Error("Nome do treino é obrigatório");
    }

    return this.workoutRepository.create(data);
  }

  // 🔥 (mantido - usado na aba de treinos)
  async findAll(userId: string): Promise<IWorkout[]> {
    return this.workoutRepository.findAll(userId);
  }

  // 🔥 NOVO - treinos do usuário (mais explícito)
  async getUserWorkouts(userId: string): Promise<IWorkout[]> {
    return prisma.userWorkout.findMany({
      where: {
        userId: userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }

  // 🔥 NOVO - catálogo (HOME)
  async getCatalog(): Promise<IWorkout[]> {
    return prisma.userWorkout.findMany({
      where: {
        userId: null,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new Error("Treino não encontrado");
    }

    await this.workoutRepository.delete(id);
  }

  private calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1;
  }

  async completeWorkout(userId: string, workoutId: string) {
    const xpGained = 50;

    const workout = await this.workoutRepository.findById(workoutId);

    if (!workout) {
      throw new Error("Treino não encontrado");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const alreadyCompletedToday = await prisma.completedWorkout.findFirst({
      where: {
        userId,
        workoutId,
        doneAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (alreadyCompletedToday) {
      throw new Error("Você já concluiu esse treino hoje.");
    }

    await prisma.completedWorkout.create({
      data: {
        userId,
        workoutId,
        xpEarned: xpGained,
      },
    });

    const newXp = user.xp + xpGained;
    const newLevel = this.calculateLevel(newXp);

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    const totalCompleted = await prisma.completedWorkout.count({
      where: { userId },
    });

    if (totalCompleted === 1) {
      const badge = await prisma.badge.findFirst({
        where: { name: "Iniciante" },
      });

      if (badge) {
        const alreadyHasBadge = await prisma.userBadge.findFirst({
          where: {
            userId,
            badgeId: badge.id,
          },
        });

        if (!alreadyHasBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });
        }
      }
    }

    return {
      message: "Treino concluído com sucesso",
      xpGained,
      newXp,
      newLevel,
      totalCompleted,
    };
  }
}