import { prisma } from "../database/prisma";
import { WorkoutRepository } from "../repository/WorkoutRepository";
import { BadgeService } from "./BadgeService";
import { StreakService } from "./StreakService";
import { NotificationService } from "./NotificationService";
import { io } from "../../server";

export class WorkoutService {
  private workoutRepository = new WorkoutRepository();
  private badgeService = new BadgeService();
  private streakService = new StreakService();
  private notificationService = new NotificationService();

  async create(data: { name: string; userId: string; exercises: any[] }) {
    if (!data.exercises || data.exercises.length === 0) {
      throw new Error("O treino precisa ter pelo menos um exercício");
    }

    const workout = await this.workoutRepository.create(data);

    // Notificar o aluno se o treino foi criado por um personal
    if (data.userId) {
      await this.notificationService.create(
        data.userId,
        "Novo Treino Prescrito!",
        `Um novo plano de treino "${data.name}" foi adicionado ao seu perfil por um instrutor.`,
        "WORKOUT_PRESCRIBED"
      );
    }

    return workout;
  }

  async getAllCatalog() {
    return this.workoutRepository.findAllCatalog();
  }

  async getAllByUser(userId: string) {
    return this.workoutRepository.findAllByUser(userId);
  }

  async getById(id: string) {
    return this.workoutRepository.findById(id);
  }

  async delete(id: string) {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new Error("Treino não encontrado");
    }

    // Proteção contra erro de Foreign Key
    await prisma.userWorkoutExercise.deleteMany({ where: { userWorkoutId: id } });
    await prisma.completedWorkout.deleteMany({ where: { workoutId: id } });
    await prisma.completedWorkoutExercise.deleteMany({ where: { workoutId: id } });
    await prisma.workoutShare.deleteMany({ where: { workoutId: id } });

    return this.workoutRepository.delete(id);
  }

  async completeWorkout(userId: string, workoutId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const alreadyCompletedToday = await prisma.completedWorkout.findFirst({
      where: {
        userId,
        workoutId,
        doneAt: {
          gte: today,
        },
      },
    });

    // Se já completou hoje, não ganha mais XP
    const xpGained = alreadyCompletedToday ? 0 : 50;

    await prisma.completedWorkout.create({
      data: {
        userId,
        workoutId,
        xpEarned: xpGained
      },
    });

    let newXp = user.xp || 0;
    let newLevel = user.level || 1;

    if (xpGained > 0) {
      newXp += xpGained;
      newLevel = Math.floor(newXp / 100) + 1;

      await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel },
      });
    }

    const streakData = await this.streakService.updateUserStreak(userId);

    // Notificar frontend em tempo real
    io.to(userId).emit("workout:completed", {
      workoutId,
      xpGained,
      streak: streakData.streak,
      message: xpGained > 0 ? "Treino concluído com sucesso!" : "Treino registrado!"
    });

    if (xpGained > 0) {
      await this.notificationService.create(
        userId,
        "Treino Finalizado!",
        `Treino concluído! Você ganhou ${xpGained} XP. Sequência: ${streakData.streak} dias!`,
        "WORKOUT_COMPLETED"
      );
    }

    return {
      message: xpGained > 0 ? "Treino concluído com sucesso" : "Treino registrado",
      xpGained,
      newXp,
      newLevel,
      streak: streakData.streak,
    };
  }

  async completeExercise(userId: string, workoutId: string, exerciseId: string) {
    const workoutExercise = await prisma.userWorkoutExercise.findFirst({
      where: { userWorkoutId: workoutId, exerciseId },
      include: { exercise: true },
    });

    if (!workoutExercise) throw new Error("Exercício não encontrado no treino");

    const todayStr = new Date().toISOString().split('T')[0];

    const alreadyDoneToday = await prisma.completedWorkoutExercise.findFirst({
      where: {
        userId,
        workoutId,
        exerciseId,
        completionDate: todayStr
      }
    });

    const xpGained = alreadyDoneToday ? 0 : 10;

    if (!alreadyDoneToday) {
      await prisma.completedWorkoutExercise.create({
        data: {
          userId,
          workoutId,
          exerciseId,
          xpEarned: xpGained,
          completionDate: todayStr
        },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("Usuário não encontrado");

      const newXp = (user.xp || 0) + xpGained;
      const newLevel = Math.floor(newXp / 100) + 1;

      await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel },
      });

      const streakData = await this.streakService.updateUserStreak(userId);

      // Notificar via Socket
      io.to(userId).emit("exercise:completed", {
        exerciseName: workoutExercise.exercise.name,
        xpGained,
        streak: streakData.streak
      });

      return {
        message: "Exercício concluído com sucesso",
        xpGained,
        newXp,
        newLevel,
        streak: streakData.streak,
      };
    }

    return {
      message: "Exercício já realizado hoje",
      xpGained: 0
    };
  }

  async getFocusDistribution(userId: string) {
    // 1. Buscar treinos completos e seus exercícios
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: { userId },
      include: {
        workout: {
          include: {
            exercises: {
              include: {
                exercise: {
                  include: {
                    primaryMuscle: true,
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // 2. Buscar exercícios completados individualmente
    const completedExercises = await prisma.completedWorkoutExercise.findMany({
      where: { userId },
      include: {
        exercise: {
          include: { 
            primaryMuscle: true,
            category: true 
          }
        }
      }
    });

    const counts: Record<string, number> = {};

    // Contabilizar exercícios de treinos completos
    completedWorkouts.forEach(cw => {
      if (cw.workout?.exercises) {
        cw.workout.exercises.forEach(we => {
          const muscleName = we.exercise.primaryMuscle?.name || we.exercise.category?.name || "Outros";
          counts[muscleName] = (counts[muscleName] || 0) + 1;
        });
      }
    });

    // Contabilizar exercícios individuais (evitando contar o que já foi contado no treino completo se necessário, 
    // mas aqui somamos para dar peso ao esforço extra)
    completedExercises.forEach(ce => {
      const muscleName = ce.exercise.primaryMuscle?.name || ce.exercise.category?.name || "Outros";
      counts[muscleName] = (counts[muscleName] || 0) + 1;
    });

    if (Object.keys(counts).length === 0) {
      return [{ name: "Sem dados", value: 1 }];
    }

    // Retornar formatado e ordenado
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  async getWeeklyStats(userId: string) {
    if (!userId) throw new Error("ID do usuário é obrigatório");

    const today = new Date();
    const dayOfWeek = today.getDay(); 

    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setUTCHours(0, 0, 0, 0);

    const workouts = await prisma.completedWorkout.findMany({
      where: {
        userId,
        doneAt: { gte: monday }
      },
      select: { doneAt: true }
    });

    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    const data = days.map(day => ({ name: day, treinos: 0 }));

    workouts.forEach(w => {
      const d = new Date(w.doneAt).getDay();
      const index = d === 0 ? 6 : d - 1;
      data[index].treinos++;
    });

    return data;
  }
}
