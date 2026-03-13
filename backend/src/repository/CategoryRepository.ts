import { prisma } from "../database/prisma";

export class CategoryRepository {

  async findAll() {
    return prisma.category.findMany();
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id }
    });
  }

  async getExercises(id: string) {
    return prisma.exercise.findMany({
      where: {
        categoryId: id
      }
    });
  }

}