import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";

export class CategoryController {

  private service = new CategoryService();

  async getAll(req: Request, res: Response) {

    const categories = await this.service.getCategories();

    return res.json(categories);

  }

  async getById(req: Request, res: Response) {

    const { id } = req.params;

    const category = await this.service.getCategoryById(id as string);

    return res.json(category);

  }

  async getExercises(req: Request, res: Response) {

    const { id } = req.params;

    const exercises = await this.service.getCategoryExercises(id as string);

    return res.json(exercises);

  }

}