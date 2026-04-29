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

    const xpGained = alreadyCompletedToday ? 10 : 50;

    await prisma.completedWorkout.create({
      data: {
        userId,
        workoutId,
        xpEarned: xpGained
      },
    });

    const newXp = (user.xp || 0) + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });

    const streakData = await this.streakService.updateUserStreak(userId);

    // Notificar frontend em tempo real
    io.to(userId).emit("workout:completed", {
      workoutId,
      xpGained,
      streak: streakData.streak,
      message: alreadyCompletedToday ? "Treino registrado!" : "Treino concluído com sucesso!"
    });

    // Salvar no banco
    await this.notificationService.create(
      userId,
      "Treino Finalizado!",
      alreadyCompletedToday ? "Seu treino foi registrado." : `Treino concluído! Você ganhou ${xpGained} XP. Sequência: ${streakData.streak} dias!`,
      "WORKOUT_COMPLETED"
    );

    return {
      message: alreadyCompletedToday ? "Treino registrado" : "Treino concluído com sucesso",
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

    const xpGained = 10;

    await prisma.completedWorkoutExercise.create({
      data: {
        userId,
        workoutId,
        exerciseId,
        xpEarned: xpGained,
        completionDate: new Date().toISOString().split('T')[0]
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

  async getFocusDistribution(userId: string) {
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
    completedExercises.forEach(ce => {
      // Priorizar o grupo muscular primário para o gráfico de foco
      const muscleName = ce.exercise.primaryMuscle?.name || ce.exercise.category?.name || "Outros";
      counts[muscleName] = (counts[muscleName] || 0) + 1;
    });

    if (Object.keys(counts).length === 0) {
      return [{ name: "Sem dados", value: 1 }];
    }

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
