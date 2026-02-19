import { Router } from "express";
import { AuthController } from "../controller/AuthController";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login.bind(controller));

export default router;