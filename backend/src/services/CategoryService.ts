import { CategoryRepository } from "../repository/CategoryRepository";

export class CategoryService {

  private repository = new CategoryRepository();

  async getCategories() {
    return this.repository.findAll();
  }

  async getCategoryById(id: string) {
    return this.repository.findById(id);
  }

  async getCategoryExercises(id: string) {
    return this.repository.getExercises(id);
  }

}