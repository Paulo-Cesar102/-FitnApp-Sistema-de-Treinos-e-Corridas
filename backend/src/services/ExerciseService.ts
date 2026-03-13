import { ExerciseRepository } from "../repository/ExerciseRepository";

export class ExerciseService {

  private repository = new ExerciseRepository();

  // =============================
  // LISTAR TODOS
  // =============================
  async getAllExercises() {

    return this.repository.findAll();

  }

  // =============================
  // BUSCAR POR ID
  // =============================
  async getExerciseById(id: string) {

    return this.repository.findById(id);

  }

  // =============================
  // BUSCAR POR CATEGORIA
  // =============================
  async getExercisesByCategory(categoryId: string) {

    return this.repository.findByCategory(categoryId);

  }

}