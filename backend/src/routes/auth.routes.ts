import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validate } from "../middlewares/validate"; // Importa o validador
import { loginSchema } from "../schemas/user.schema"; // Importa o desenho do login

const router = Router();
const controller = new UserController();

// A mágica acontece aqui:
router.post("/login", validate(loginSchema), controller.login.bind(controller));

export default router;