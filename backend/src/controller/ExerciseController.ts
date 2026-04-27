import { Request, Response } from "express";
import { ExerciseService } from "../services/ExerciseService";
import { SmartCoachService } from "../services/SmartCoachService";

export class ExerciseController {

  private service = new ExerciseService();
  private coachService = new SmartCoachService();

  async getAll(req: Request, res: Response) {
    const exercises = await this.service.getAllExercises();
    return res.json(exercises);
  }

  async getSuggestion(req: Request, res: Response) {
    try {
      const { id: exerciseId } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const suggestion = await this.coachService.getSuggestion(userId, exerciseId);
      return res.json(suggestion);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {

    const { id } = req.params as { id: string };

const exercise = await this.service.getExerciseById(id as string);

    if (!exercise) {
      return res.status(404).json({
        message: "Exercício não encontrado"
      });
    }

    return res.json(exercise);

  }


  async getByCategory(req: Request, res: Response) {

  const { categoryId } = req.params as { categoryId: string };

  const exercises = await this.service.getExercisesByCategory(categoryId as string);

  return res.json(exercises);

}

}