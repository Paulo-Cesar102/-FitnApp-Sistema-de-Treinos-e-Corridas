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

    let xpGained = 0;
    if (!alreadyCompletedToday) {
      xpGained = this.calculateWorkoutXp(workout);
      await prisma.completedWorkout.create({
        data: { userId, workoutId, xpEarned: xpGained },
      });

      const currentXp = user.xp ?? 0;
      const newXp = currentXp + xpGained;
      const newLevel = this.calculateLevel(newXp);

      await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel },
      });
    }

    // Registrar volume para o gráfico (Sempre registra)
    const today = new Date().toISOString().split("T")[0];
    if (workout.exercises && workout.exercises.length > 0) {
      for (const item of workout.exercises) {
        await prisma.completedWorkoutExercise.create({
          data: {
            userId,
            workoutId,
            exerciseId: item.exerciseId,
            xpEarned: 0, 
            completionDate: `${today}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
          }
        });
      }
    }

    const totalCompleted = await prisma.completedWorkout.count({ where: { userId } });
    const newBadges = await this.badgeService.grantBadgesByLevel(userId, user.level);
    const streakData = await this.streakService.updateUserStreak(userId);

    return {
      message: alreadyCompletedToday ? "Treino registrado (sem XP adicional)" : "Treino concluído com sucesso",
      xpGained,
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

  // 🔥 NOVO: Distribuição de Foco (Categorias)
  async getFocusDistribution(userId: string) {
    const completedExercises = await prisma.completedWorkoutExercise.findMany({
      where: { userId },
      include: {
        exercise: {
          include: {
            category: true,
          },
        },
      },
    });

    const counts: Record<string, number> = {};
    let total = 0;

    completedExercises.forEach((item) => {
      const categoryName = item.exercise.category.name;
      counts[categoryName] = (counts[categoryName] || 0) + 1;
      total++;
    });

    // Converter para o formato do gráfico { name, value }
    const data = Object.keys(counts).map((name) => ({
      name,
      value: counts[name],
      percentage: total > 0 ? Math.round((counts[name] / total) * 100) : 0,
    }));

    // Se não houver dados, retorna um padrão vazio para o gráfico não quebrar
    if (data.length === 0) {
      return [{ name: "Sem dados", value: 1, percentage: 0 }];
    }

    return data;
  }

  // 🔥 NOVO: Atividade Semanal (Treinos por dia)
  async getWeeklyStats(userId: string) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Dom) a 6 (Sáb)
    
    // Ajustar para considerar Segunda como o primeiro dia da semana (padrão Brasil)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: {
        userId,
        doneAt: { gte: monday }
      }
    });

    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const stats = days.map((day, index) => {
      // Filtrar treinos que batem com o dia da semana (considerando 0=Seg, 1=Ter...)
      const count = completedWorkouts.filter(w => {
        const d = new Date(w.doneAt);
        let dayIndex = d.getDay() - 1; 
        if (dayIndex === -1) dayIndex = 6; // Domingo
        return dayIndex === index;
      }).length;

      return { name: day, treinos: count };
    });

    return stats;
  }
}