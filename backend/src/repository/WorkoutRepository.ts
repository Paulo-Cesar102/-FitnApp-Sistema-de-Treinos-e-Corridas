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
          connect: {id: data.userId}
        }
      }
    });

    return workout;
  }

 async findAll(userId: string): Promise<IWorkout[]> {
  return prisma.userWorkout.findMany({
    where: {
      userId: userId
    }
  });
}

  async findById(id: string): Promise<IWorkout | null> {
    return prisma.userWorkout.findUnique({
      where: { id }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.userWorkout.delete({
      where: { id }
    });
  }

}