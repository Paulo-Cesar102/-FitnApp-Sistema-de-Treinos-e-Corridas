import { Router } from "express";
import { ExerciseController } from "../controller/ExerciseController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new ExerciseController();

router.get("/", controller.getAll.bind(controller));

router.get("/:id/suggestion", authMiddleware, controller.getSuggestion.bind(controller));

router.get("/:id", controller.getById.bind(controller));

router.get("/category/:categoryId", controller.getByCategory.bind(controller));

export default router;