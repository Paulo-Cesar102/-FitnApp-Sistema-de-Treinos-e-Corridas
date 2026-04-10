import { prisma } from "../database/prisma";
import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";
import { IWorkoutRepository } from "./IWorkoutRepository";

export class WorkoutRepository implements IWorkoutRepository {

  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
      const workout = await prisma.userWorkout.create({
    data: {
      name: data.name,
      userId: data.userId,

      // 🔥 AQUI ESTÁ O SEGREDO
      exercises: {
        create: data.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
        })),
      },
    },

    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });

  return workout as any;
}

  async findAll(userId?: string) {
  return prisma.userWorkout.findMany({
    where: {
      // Se vier um ID, filtra por ele. Se não vier, busca onde o campo é null.
      userId: userId ? userId : { equals: null } as any
    },
    include: {
      exercises: {
        include: { exercise: true }
      }
    }
  });
}

  async findById(id: string): Promise<IWorkout | null> {
    return prisma.userWorkout.findUnique({
      where: { id },
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