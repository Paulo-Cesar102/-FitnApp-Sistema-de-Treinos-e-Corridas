import { Request, Response } from "express";
import { ExerciseService } from "../services/ExerciseService";

export class ExerciseController {

  private exerciseService = new ExerciseService();

  async create(req: Request, res: Response) {
    try {

      const { name, description, categoryId } = req.body;

      const exercise = await this.exerciseService.create({
        name,
        description,
        categoryId
      });

      return res.status(201).json(exercise);

    } catch (error) {

      return res.status(400).json({
        error: (error as Error).message
      });

    }
  }

  async findAll(req: Request, res: Response) {

    const exercises = await this.exerciseService.findAll();

    return res.json(exercises);

  }

  async delete(req: Request, res: Response) {

   const { id } = req.params;

await this.exerciseService.delete(id as string);

    return res.json({
      message: "Exercise deleted"
    });

  }

}