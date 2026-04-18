import { prisma } from "../database/prisma";
import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";
import { WorkoutRepository } from "../repository/WorkoutRepository";
import { BadgeService } from "./BadgeService";
import { StreakService } from "./StreakService";

export class WorkoutService {
  private workoutRepository = new WorkoutRepository();
  private badgeService = new BadgeService();
  private streakService = new StreakService();

  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
    if (!data.name) {
      throw new Error("Nome do treino é obrigatório");
    }

    if (!data.exercises || data.exercises.length === 0) {
      throw new Error("O treino precisa ter pelo menos um exercício");
    }

    return this.workoutRepository.create(data);
  }

  async findAll(userId: string): Promise<IWorkout[]> {
    return this.workoutRepository.findAll(userId);
  }

  async getUserWorkouts(userId: string): Promise<IWorkout[]> {
    return prisma.userWorkout.findMany({
      where: { userId },
      include: {
        exercises: { include: { exercise: true } },
      },
    }) as unknown as IWorkout[];
  }

  async getCatalog(): Promise<IWorkout[]> {
    return prisma.userWorkout.findMany({
      where: { userId: { equals: null } },
      include: {
        exercises: { include: { exercise: true } },
      },
    }) as unknown as IWorkout[];
  }

  async delete(id: string): Promise<void> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new Error("Treino não encontrado");
    }

    // 🔥 Proteção contra erro de Foreign Key (Recuperado do antigo)
    await prisma.userWorkoutExercise.deleteMany({ where: { userWorkoutId: id } });
    await prisma.completedWorkout.deleteMany({ where: { workoutId: id } });
    await prisma.completedWorkoutExercise.deleteMany({ where: { workoutId: id } });
    await prisma.workoutShare.deleteMany({ where: { workoutId: id } });

    await this.workoutRepository.delete(id);
  }

  private calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1;
  }

  private getDifficultyBaseXp(level: string): number {
    switch (level) {
      case "BEGINNER": return 10;
      case "INTERMEDIATE": return 20;
      case "ADVANCED": return 30;
      default: return 10;
    }
  }

  private calculateWorkoutXp(workout: any): number {
    let totalXp = 0;
    if (!workout.exercises || workout.exercises.length === 0) return 10;

    for (const item of workout.exercises) {
      const baseXp = this.getDifficultyBaseXp(item.exercise.level);
      const volumeBonus = Math.floor((item.sets * item.reps) / 10);
      totalXp += baseXp + volumeBonus;
    }
    return totalXp;
  }

  private calculateExerciseXp(item: any): number {
    const baseXp = this.getDifficultyBaseXp(item.exercise.level);
    const volumeBonus = Math.floor((item.sets * item.reps) / 10);
    return baseXp + volumeBonus;
  }

  async completeWorkout(userId: string, workoutId: string) {
    const workout = await this.workoutRepository.findById(workoutId);
    if (!workout) throw new Error("Treino não encontrado");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const alreadyCompletedToday = await prisma.completedWorkout.findFirst({
      where: {
        userId,
        workoutId,
        doneAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (alreadyCompletedToday) throw new Error("Você já concluiu esse treino hoje.");

    const xpGained = this.calculateWorkoutXp(workout);
    const currentXp = user.xp ?? 0;
    const newXp = currentXp + xpGained;
    const newLevel = this.calculateLevel(newXp);

    await prisma.completedWorkout.create({
      data: { userId, workoutId, xpEarned: xpGained },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });

    const totalCompleted = await prisma.completedWorkout.count({ where: { userId } });
    const newBadges = await this.badgeService.grantBadgesByLevel(userId, newLevel);
    
    // 🔥 Atualiza o foguinho ao completar o treino completo
    const streakData = await this.streakService.updateUserStreak(userId);

    return {
      message: "Treino concluído com sucesso",
      xpGained,
      newXp,
      newLevel,
      totalCompleted,
      newBadges,
      streak: streakData.streak,
    };
  }

  async completeExercise(userId: string, workoutId: string, exerciseId: string) {
    const workout = await prisma.userWorkout.findUnique({
      where: { id: workoutId },
      include: { exercises: { include: { exercise: true } } },
    });

    if (!workout) throw new Error("Treino não encontrado");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const workoutExercise = workout.exercises.find((item) => item.exerciseId === exerciseId);
    if (!workoutExercise) throw new Error("Exercício não encontrado neste treino");

    const today = new Date().toISOString().split("T")[0];
    const alreadyCompletedToday = await prisma.completedWorkoutExercise.findFirst({
      where: { userId, workoutId, exerciseId, completionDate: today },
    });

    if (alreadyCompletedToday) throw new Error("Você já concluiu esse exercício hoje.");

    const xpGained = this.calculateExerciseXp(workoutExercise);
    const currentXp = user.xp ?? 0;
    const newXp = currentXp + xpGained;
    const newLevel = this.calculateLevel(newXp);

    await prisma.completedWorkoutExercise.create({
      data: { userId, workoutId, exerciseId, xpEarned: xpGained, completionDate: today },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });

    const newBadges = await this.badgeService.grantBadgesByLevel(userId, newLevel);

    // 🔥 Atualiza o foguinho ao completar um exercício individual
    const streakData = await this.streakService.updateUserStreak(userId);

    return {
      message: "Exercício concluído com sucesso",
      xpGained,
      newXp,
      newLevel,
      newBadges,
      streak: streakData.streak,
    };
  }
}