import { Request, Response } from "express";
import { WorkoutService } from "../services/WorkoutService";

export class WorkoutController {
  private workoutService = new WorkoutService();

  async create(req: Request, res: Response) {
    try {
      const { name, exercises } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      if (!name || !exercises) {
        return res
          .status(400)
          .json({ message: "Nome e exercícios são obrigatórios" });
      } 

      const workout = await this.workoutService.create({
        name,
        userId,
        exercises,
      });

      return res.status(201).json(workout);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar treino",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params as any;
      const { name, exercises } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      if (!name || !exercises) {
        return res
          .status(400)
          .json({ message: "Nome e exercícios são obrigatórios" });
      }

      const workout = await this.workoutService.update(id, { name, exercises });
      return res.status(200).json(workout);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao atualizar treino",
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      const workouts = await this.workoutService.getAllByUser(userId);
      return res.json(workouts);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao listar treinos",
      });
    }
  }

  async getUserWorkouts(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      const workouts = await this.workoutService.getAllByUser(userId);
      return res.status(200).json(workouts);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar treinos do usuário",
      });
    }
  }

  async getWorkoutsByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params as any;

      if (!userId) {
        return res.status(400).json({ message: "userId é obrigatório" });
      }

      const workouts = await this.workoutService.getAllByUser(userId);
      return res.status(200).json(workouts);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar treinos do usuário específico",
      });
    }
  }

  async getCatalog(req: Request, res: Response) {
    try {
      const catalog = await this.workoutService.getAllCatalog();
      return res.status(200).json(catalog);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao buscar catálogo",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await this.workoutService.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao deletar treino",
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

      const result = await this.workoutService.completeWorkout(
        userId,
        workoutId
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao concluir treino",
      });
    }
  }

  async completeExercise(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { workoutId, exerciseId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      if (!workoutId || !exerciseId) {
        return res.status(400).json({
          message: "workoutId e exerciseId são obrigatórios",
        });
      }

      const result = await this.workoutService.completeExercise(
        userId,
        workoutId,
        exerciseId
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao concluir exercício",
      });
    }
  }

  async getFocusStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      const stats = await this.workoutService.getFocusDistribution(userId);
      return res.json(stats);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar foco",
      });
    }
  }

  async getWeeklyStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não identificado" });
      }

      const stats = await this.workoutService.getWeeklyStats(userId);
      return res.json(stats);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar semanal",
      });
    }
  }
}
