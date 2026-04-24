import { prisma } from "../database/prisma";
import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";

export class WorkoutRepository {
  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
    const workout = await prisma.userWorkout.create({
      data: {
        name: data.name,
        userId: data.userId,
        gymId: data.gymId,
        exercises: {
          create: data.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
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

    return workout as unknown as IWorkout;
  }

  async findAll(userId: string): Promise<IWorkout[]> {
    const workouts = await prisma.userWorkout.findMany({
      where: {
        userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return workouts as unknown as IWorkout[];
  }

  async findById(id: string): Promise<IWorkout | null> {
    const workout = await prisma.userWorkout.findUnique({
      where: {
        id,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return workout as unknown as IWorkout | null;
  }

  async delete(id: string): Promise<void> {
    await prisma.userWorkout.delete({
      where: {
        id,
      },
    });
  }
}