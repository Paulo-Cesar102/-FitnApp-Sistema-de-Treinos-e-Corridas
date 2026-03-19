import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";
import { authMiddleware } from "../middlewares/auth";

const workoutRoutes = Router();
const workoutController = new WorkoutController();

workoutRoutes.post("/create", authMiddleware, (req, res) =>
  workoutController.create(req, res)
);

workoutRoutes.get("/list", authMiddleware, (req, res) =>
  workoutController.findAll(req, res)
);

workoutRoutes.post("/complete", authMiddleware, (req, res) =>
  workoutController.complete(req, res)
);

workoutRoutes.delete("/:id", authMiddleware, (req, res) =>
  workoutController.delete(req, res)
);

export { workoutRoutes };