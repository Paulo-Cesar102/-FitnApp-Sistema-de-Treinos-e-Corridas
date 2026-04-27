import { prisma } from "../database/prisma";
import { Difficulty } from "@prisma/client";

export class SmartCoachRepository {
  /**
   * Busca exercícios reais baseados no nível de dificuldade e opcionalmente por grupo muscular
   */
  async getExercises(level: Difficulty, muscleGroup?: string, limit: number = 4) {
    if (muscleGroup) {
      return await prisma.exercise.findMany({
        where: {
          level,
          primaryMuscle: {
            name: {
              contains: muscleGroup,
              mode: 'insensitive'
            }
          }
        },
        include: {
          primaryMuscle: true
        },
        take: limit,
      });
    }

    return await prisma.exercise.findMany({
      where: { level },
      include: {
        primaryMuscle: true
      },
      take: limit,
    });
  }

  /**
   * Busca o último treino realizado ou criado pelo usuário para dar contexto
   */
  async getLastWorkout(userId: string) {
    return await prisma.userWorkout.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: {
              include: { primaryMuscle: true }
            }
          }
        }
      }
    });
  }

  /**
   * Busca exercícios reais baseados no nível de dificuldade de forma aleatória
   */
  async getRandomExercisesByLevel(level: Difficulty, limit: number = 4) {
    const count = await prisma.exercise.count({ where: { level } });
    const skip = Math.max(0, Math.floor(Math.random() * (count - limit)));
    
    return await prisma.exercise.findMany({
      where: { level },
      skip: skip,
      take: limit,
    });
  }

  /**
   * Busca dados vitais do usuário para cálculos de dieta
   */
  async getUserFitnessData(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        weightLogs: { take: 1, orderBy: { date: 'desc' } }
      }
    });
  }

  /**
   * Incrementa o contador de uso (para manter o controle de limites se desejar)
   */
  async incrementUsage(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        aiUsageCount: { increment: 1 },
        lastAiUsage: new Date()
      }
    });
  }
}
