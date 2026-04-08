import { prisma } from "../database/prisma";

export class ExerciseRepository {

  async findAll() {
    return prisma.exercise.findMany({
      include: {
        category: true,
        primaryMuscle: true, 
      }
    });
  }

  async findById(id: string) {
    return prisma.exercise.findUnique({
      where: { id },
      include: {
        category: true,
        primaryMuscle: true,
      }
    });
  }

  async findByCategory(categoryId: string) {
    return prisma.exercise.findMany({
      where: {
        categoryId
      },
      include: {
        primaryMuscle: true, 
      }
    });
  }
}