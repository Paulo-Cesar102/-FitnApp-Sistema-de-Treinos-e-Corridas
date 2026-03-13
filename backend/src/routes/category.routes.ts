    import { Router } from "express";
import { CategoryController } from "../controller/CategoryController";

const router = Router();
const controller = new CategoryController();

router.get("/categories", controller.getAll.bind(controller));

router.get("/categories/:id", controller.getById.bind(controller));

router.get("/categories/:id/exercises", controller.getExercises.bind(controller));

export default router;