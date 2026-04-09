import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";
import { authMiddleware } from "../middlewares/auth";

const workoutRoutes = Router();
const workoutController = new WorkoutController();

// Caminho: GET /workouts
workoutRoutes.get("/", authMiddleware, (req, res) =>
  workoutController.findAll(req, res)
);

// Caminho: POST /workouts
workoutRoutes.post("/", authMiddleware, (req, res) =>
  workoutController.create(req, res)
);

workoutRoutes.post("/complete", authMiddleware, (req, res) =>
  workoutController.complete(req, res)
);

workoutRoutes.delete("/:id", authMiddleware, (req, res) =>
  workoutController.delete(req, res)
);

export { workoutRoutes };