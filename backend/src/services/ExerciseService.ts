import { ExerciseRepository } from "../repository/ExerciseRepository";

export class ExerciseService {

  private exerciseRepository = new ExerciseRepository();

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
  }) {

    if (!data.name)
      throw new Error("Exercise name is required");

    return this.exerciseRepository.create(data);
  }

  async findAll() {
    return this.exerciseRepository.findAll();
  }

  async delete(id: string) {
    return this.exerciseRepository.delete(id);
  }

}