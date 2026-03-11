import { Router } from "express";
import { ExerciseController } from "../controller/ExerciseController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new ExerciseController();

router.post("/exercises", authMiddleware, controller.create.bind(controller));
router.get("/exercises", controller.findAll.bind(controller));
router.delete("/exercises/:id", authMiddleware, controller.delete.bind(controller));

export default router;