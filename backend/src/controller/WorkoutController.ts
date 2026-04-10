import { Request, Response } from "express";
import { WorkoutService } from "../services/WorkoutService";

export class WorkoutController {
  private workoutService = new WorkoutService();

  // 🔥 CREATE (CORRIGIDO)
  async create(req: Request, res: Response) {
    try {
      const { name, exercises } = req.body; // 🔥 AGORA PEGA OS EXERCÍCIOS
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      if (!name || !exercises || exercises.length === 0) {
        return res.status(400).json({
          message: "Nome e exercícios são obrigatórios",
        });
      }

      const workout = await this.workoutService.create({
        name,
        userId,
        exercises, // 🔥 ESSENCIAL
      });

      return res.status(201).json(workout);
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao criar treino",
      });
    }
  }

  // 🔥 TREINOS DO USUÁRIO
  async getUserWorkouts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      const workouts = await this.workoutService.getUserWorkouts(userId);

      return res.json(workouts);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao listar treinos do usuário",
      });
    }
  }

  // 🔥 CATÁLOGO
  async getCatalog(req: Request, res: Response) {
    try {
      const workouts = await this.workoutService.getCatalog();
      return res.json(workouts);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar catálogo",
      });
    }
  }

  // 🔥 DELETE (ARRUMADO)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "ID inválido" });
      }

      await this.workoutService.delete(id);

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao deletar treino",
      });
    }
  }

  // 🔥 COMPLETE
  async complete(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { workoutId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      if (!workoutId) {
        return res.status(400).json({ message: "workoutId é obrigatório" });
      }

      const result = await this.workoutService.completeWorkout(
        userId,
        workoutId
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao concluir treino",
      });
    }
  }
}