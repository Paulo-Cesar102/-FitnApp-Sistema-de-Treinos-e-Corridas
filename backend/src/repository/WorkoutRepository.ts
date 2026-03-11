import { prisma } from "../database/prisma";
import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";
import { IWorkoutRepository } from "./IWorkoutRepository";

export class WorkoutRepository implements IWorkoutRepository {

  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
    const workout = await prisma.workout.create({
      data
    });

    return workout;
  }

  async findAll(): Promise<IWorkout[]> {
    return prisma.workout.findMany();
  }

  async findById(id: string): Promise<IWorkout | null> {
    return prisma.workout.findUnique({
      where: { id }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.workout.delete({
      where: { id }
    });
  }

}