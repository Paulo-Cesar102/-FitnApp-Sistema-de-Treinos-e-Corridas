import { Request, Response } from "express";
import { WorkoutService } from "../services/WorkoutService";

export class WorkoutController {
  private workoutService = new WorkoutService();

  async create(req: Request, res: Response) {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não identificado" });
    }

    const workout = await this.workoutService.create({
      name,
      userId,
    });

    return res.status(201).json(workout);
  }

  async findAll(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não identificado" });
    }

    const workouts = await this.workoutService.findAll(userId);

    return res.json(workouts);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await this.workoutService.delete(id as string);

    return res.status(204).send();
  }

  async complete(req: Request, res: Response) {
    const userId = req.user?.id;
    const { workoutId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não identificado" });
    }

    if (!workoutId) {
      return res.status(400).json({ message: "workoutId é obrigatório" });
    }

    const result = await this.workoutService.completeWorkout(userId, workoutId);

    return res.status(200).json(result);
  }
}