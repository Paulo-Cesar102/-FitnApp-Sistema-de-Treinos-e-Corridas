import { prisma } from "../database/prisma";

export class ExerciseRepository {

  async findAll() {
    return prisma.exercise.findMany({
      include: {
        category: true
      }
    });
  }

  async findById(id: string) {
    return prisma.exercise.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
  }

  async findByCategory(categoryId: string) {
    return prisma.exercise.findMany({
      where: {
        categoryId
      }
    });
  }

}