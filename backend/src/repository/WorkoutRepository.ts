import { prisma } from "../database/prisma";
import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";
import { IWorkoutRepository } from "./IWorkoutRepository";

export class WorkoutRepository implements IWorkoutRepository {

  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
    const workout = await prisma.userWorkout.create({
      data: {
        name: data.name,
        user: {
          connect: { id: data.userId }
        }
      },
      // Opcional: retornar já com os exercícios se você criar o treino com eles
      include: {
        exercises: {
          include: {
            exercise: true
          }
        }
      }
    });

    return workout as any; 
  }

 async findAll(userId: string) {
  return prisma.userWorkout.findMany({
    where: {}, // REMOVA o 'userId' daqui temporariamente
    include: {
      exercises: {
        include: {
          exercise: true
        }
      }
    }
  });
}

  async findById(id: string): Promise<IWorkout | null> {
    return prisma.userWorkout.findUnique({
      where: { id },
      // Incluímos aqui também para quando você clicar no card específico
      include: {
        exercises: {
          include: {
            exercise: true
          }
        }
      }
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.userWorkout.delete({
      where: { id }
    });
  }
}