import { Router } from "express";
import { SmartCoachController } from "../controller/SmartCoachController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new SmartCoachController();

router.post("/ask", authMiddleware, controller.ask.bind(controller));

export { router as smartCoachRoutes };
