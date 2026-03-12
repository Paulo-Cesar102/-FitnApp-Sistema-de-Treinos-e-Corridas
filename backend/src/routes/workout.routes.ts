import { Router } from "express";
import { WorkoutController } from "../controller/WorkoutController";
import { authMiddleware } from "../middlewares/auth"; // <--- IMPORTANTE: ajuste o caminho se necessário

const workoutRoutes = Router();
const workoutController = new WorkoutController();

// ADICIONE O authMiddleware AQUI ANTES DO CONTROLLER
workoutRoutes.post(
  "/create", 
  authMiddleware, // O segurança da porta
  (req, res) => workoutController.create(req, res)
);

workoutRoutes.get("/list", authMiddleware, (req, res) => workoutController.findAll(req, res));
workoutRoutes.delete("/:id", authMiddleware, (req, res) => workoutController.delete(req, res));

export { workoutRoutes };