import { Router } from "express";
import { UserController } from "../controller/UserController";

const router = Router();
const controller = new UserController();


router.post("/login", controller.login.bind(controller));

export default router;