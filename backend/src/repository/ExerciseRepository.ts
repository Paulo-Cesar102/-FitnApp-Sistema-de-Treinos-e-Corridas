import { prisma } from "../database/prisma";


export class ExerciseRepository {

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
  }) {
    return prisma.exercise.create({
      data
    });
  }

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

  async delete(id: string) {
    return prisma.exercise.delete({
      where: { id }
    });
  }

}