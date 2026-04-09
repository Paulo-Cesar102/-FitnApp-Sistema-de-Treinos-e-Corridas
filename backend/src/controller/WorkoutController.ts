import { Request, Response } from "express";
import { WorkoutService } from "../services/WorkoutService";

export class WorkoutController {
  private workoutService = new WorkoutService();

  async create(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar treino",
      });
    }
  }

 async findAll(req: Request, res: Response) {
  try {

    const userId = (req as any ).user.id; 


    const workouts = await this.workoutService.findAll(userId);

    // 3. RETORNA O JSON (Isso aqui é o que faz os cards aparecerem!)
    return res.json(workouts); 

  } catch (error) {
    console.error("Erro no Controller findAll:", error);
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Erro ao listar treinos",
    });
  }
}


  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await this.workoutService.delete(id as string);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao deletar treino",
      });
    }
  }

  async complete(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao concluir treino",
      });
    }
  }
}