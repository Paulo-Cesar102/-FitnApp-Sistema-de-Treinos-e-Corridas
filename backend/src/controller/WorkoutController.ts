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
      userId
    });

    return res.status(201).json(workout);
  }

  async findAll(req: Request, res: Response) {
    const workouts = await this.workoutService.findAll();

    return res.json(workouts);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await this.workoutService.delete(id as string);

    return res.status(204).send();
  }

}