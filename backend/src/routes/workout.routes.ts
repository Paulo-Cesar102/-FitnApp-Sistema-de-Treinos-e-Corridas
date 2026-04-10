import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";
import { authMiddleware } from "../middlewares/auth";

const workoutRoutes = Router();
const workoutController = new WorkoutController();

// 🔥 CATÁLOGO (HOME)
workoutRoutes.get("/catalog", (req, res) =>
  workoutController.getCatalog(req, res)
);

// 🔥 TREINOS DO USUÁRIO
workoutRoutes.get("/user", authMiddleware, (req, res) =>
  workoutController.getUserWorkouts(req, res)
);

// CRIAR TREINO
workoutRoutes.post("/", authMiddleware, (req, res) =>
  workoutController.create(req, res)
);

// COMPLETAR TREINO
workoutRoutes.post("/complete", authMiddleware, (req, res) =>
  workoutController.complete(req, res)
);

// DELETAR
workoutRoutes.delete("/:id", authMiddleware, (req, res) =>
  workoutController.delete(req, res)
);

export { workoutRoutes };