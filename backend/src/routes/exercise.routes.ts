import { Router } from "express";
import { ExerciseController } from "../controller/ExerciseController";

const router = Router();
const controller = new ExerciseController();

router.get("/exercises", controller.getAll.bind(controller));

router.get("/exercises/:id", controller.getById.bind(controller));

router.get("/exercises/category/:categoryId", controller.getByCategory.bind(controller));

export default router;