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

  async findAll(userId: string): Promise<IWorkout[]> {
    return this.workoutRepository.findAll(userId);
  }

  async delete(id: string): Promise<void> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new Error("Treino não encontrado");
    }

    await this.workoutRepository.delete(id);
  }

  async completeWorkout(userId: string, workoutId: string) {
    const xpGained = 50;

    await prisma.completedWorkout.create({
      data: {
        userId,
        workoutId,
        xpEarned: xpGained,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

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