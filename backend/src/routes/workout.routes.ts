import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";
import { authMiddleware } from "../middlewares/auth";

const workoutRoutes = Router();
const workoutController = new WorkoutController();

// CATÁLOGO
workoutRoutes.get("/catalog", (req, res) =>
  workoutController.getCatalog(req, res)
);

// TREINOS DO USUÁRIO LOGADO
workoutRoutes.get("/user", authMiddleware, (req, res) =>
  workoutController.getUserWorkouts(req, res)
);

// TREINOS DE UM USUÁRIO ESPECÍFICO (ex: personal)
workoutRoutes.get("/user/:userId", authMiddleware, (req, res) =>
  workoutController.getWorkoutsByUserId(req, res)
);

// CRIAR TREINO
workoutRoutes.post("/", authMiddleware, (req, res) =>
  workoutController.create(req, res)
);

// ATUALIZAR TREINO
workoutRoutes.put("/:id", authMiddleware, (req, res) =>
  workoutController.update(req, res)
);

// COMPLETAR TREINO INTEIRO
workoutRoutes.post("/complete", authMiddleware, (req, res) =>
  workoutController.complete(req, res)
);

// COMPLETAR EXERCÍCIO INDIVIDUAL
workoutRoutes.post("/complete-exercise", authMiddleware, (req, res) =>
  workoutController.completeExercise(req, res)
);

// ESTATÍSTICAS: Distribuição de foco por grupo muscular (Gráfico de Pizza)
workoutRoutes.get("/stats/focus", authMiddleware, (req, res) =>
  workoutController.getFocusStats(req, res)
);

// ESTATÍSTICAS: Volume de treinos realizados na semana atual (Gráfico de Barras)
workoutRoutes.get("/stats/weekly", authMiddleware, (req, res) =>
  workoutController.getWeeklyStats(req, res)
);

// DELETAR TREINO
workoutRoutes.delete("/:id", authMiddleware, (req, res) =>
  workoutController.delete(req, res)
);

export { workoutRoutes };
