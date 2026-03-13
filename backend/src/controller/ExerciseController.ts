import { Request, Response } from "express";
import { ExerciseService } from "../services/ExerciseService";

export class ExerciseController {

  private service = new ExerciseService();


  async getAll(req: Request, res: Response) {

    const exercises = await this.service.getAllExercises();

    return res.json(exercises);

  }

  async getById(req: Request, res: Response) {

    const { id } = req.params;

const exercise = await this.service.getExerciseById(id as string);

    if (!exercise) {
      return res.status(404).json({
        message: "Exercício não encontrado"
      });
    }

    return res.json(exercise);

  }


  async getByCategory(req: Request, res: Response) {

  const { categoryId } = req.params;

  const exercises = await this.service.getExercisesByCategory(categoryId as string);

  return res.json(exercises);

}

}