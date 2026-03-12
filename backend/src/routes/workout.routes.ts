import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";

const workoutRoutes = Router();
const workoutController = new WorkoutController();

workoutRoutes.post("/create", (req, res) => workoutController.create(req, res));
workoutRoutes.get("/list", (req, res) => workoutController.findAll(req, res));
workoutRoutes.delete("/:id", (req, res) => workoutController.delete(req, res));

export { workoutRoutes };