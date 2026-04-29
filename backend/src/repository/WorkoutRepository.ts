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
            exercise: {
              include: {
                category: true,
                primaryMuscle: true
              }
            },
          },
        },
      },
    });

    return workout as unknown as IWorkout;
  }

  async findAllByUser(userId: string): Promise<IWorkout[]> {
    const workouts = await prisma.userWorkout.findMany({
      where: {
        userId: userId,
      },
      include: {
        exercises: {
          include: {
            exercise: {
              include: {
                category: true,
                primaryMuscle: true
              }
            },
          },
        },
      },
    });

    return workouts as unknown as IWorkout[];
  }

  async findAllCatalog(): Promise<IWorkout[]> {
    const workouts = await prisma.userWorkout.findMany({
      where: {
        userId: null, // Treinos do catálogo oficial não possuem userId vinculado
      },
      include: {
        exercises: {
          include: {
            exercise: {
              include: {
                category: true,
                primaryMuscle: true
              }
            },
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
            exercise: {
              include: {
                category: true,
                primaryMuscle: true
              }
            },
          },
        },
      },
    });

    return workout as unknown as IWorkout | null;
  }

  async update(id: string, data: { name: string; exercises: any[] }): Promise<IWorkout> {
    // Primeiro limpa exercícios antigos para evitar duplicidade ou erro de constraint
    await prisma.userWorkoutExercise.deleteMany({
        where: { userWorkoutId: id }
    });

    const workout = await prisma.userWorkout.update({
        where: { id },
        data: {
            name: data.name,
            exercises: {
                create: data.exercises.map((ex: any) => ({
                    exerciseId: ex.exerciseId,
                    sets: ex.sets || 3,
                    reps: ex.reps || 12
                }))
            }
        },
        include: {
            exercises: {
                include: {
                    exercise: {
                        include: {
                            category: true,
                            primaryMuscle: true
                        }
                    },
                },
            },
        }
    });

    return workout as unknown as IWorkout;
  }

  async delete(id: string): Promise<void> {
    await prisma.userWorkout.delete({
      where: {
        id,
      },
    });
  }
}
