import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";

const workoutRoutes = Router();
const workoutController = new WorkoutController();

workoutRoutes.post("/", (req, res) => workoutController.create(req, res));
workoutRoutes.get("/", (req, res) => workoutController.findAll(req, res));
workoutRoutes.delete("/:id", (req, res) => workoutController.delete(req, res));

export { workoutRoutes };