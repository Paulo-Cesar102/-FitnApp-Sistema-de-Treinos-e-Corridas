"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const UserController_1 = require("../controller/UserController");
const validate_1 = require("../middlewares/validate");
const auth_1 = require("../middlewares/auth");
const user_schema_1 = require("../schemas/user.schema"); // Ajustei para o nome que vi no seu print
const userRoutes = (0, express_1.Router)();
exports.userRoutes = userRoutes;
const userController = new UserController_1.UserController();
// MANTÉM apenas o registro aqui
userRoutes.post("/register", (0, validate_1.validate)(user_schema_1.creatUserSchema), userController.create.bind(userController));
// ROTAS PROTEGIDAS
userRoutes.get("/users", auth_1.authMiddleware, userController.findAll.bind(userController));
userRoutes.get("/:id", auth_1.authMiddleware, userController.findById.bind(userController));
// ATUALIZAR PERFIL: Permite alterar nome, gênero e meta de peso
userRoutes.put("/:id", auth_1.authMiddleware, userController.update.bind(userController));
userRoutes.delete("/:id", auth_1.authMiddleware, userController.delete.bind(userController));
