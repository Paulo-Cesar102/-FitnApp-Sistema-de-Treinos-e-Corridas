import { Router } from "express";
import { UserController } from "../controller/UserController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new UserController();

router.get("/users", authMiddleware, controller.findAll.bind(controller));

export default router;