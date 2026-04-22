import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validate } from "../middlewares/validate";
import { authMiddleware } from "../middlewares/auth";
import { creatUserSchema } from "../schemas/user.schema"; // Ajustei para o nome que vi no seu print

const userRoutes = Router();
const userController = new UserController();

// MANTÉM apenas o registro aqui
userRoutes.post("/register", validate(creatUserSchema), userController.create.bind(userController));

// ROTAS PROTEGIDAS
userRoutes.get("/users", authMiddleware, userController.findAll.bind(userController));
userRoutes.get("/user/:id", authMiddleware, userController.findById.bind(userController));
userRoutes.delete("/user/:id", authMiddleware, userController.delete.bind(userController));

export { userRoutes };