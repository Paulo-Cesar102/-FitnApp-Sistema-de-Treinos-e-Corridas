import { Router } from "express";
import { UserController } from "../controller/UserController";

const userRoutes = Router();
const userController = new UserController();

// ==============================
// Criar usuário
// POST /users
// ==============================
userRoutes.post("/", (req, res) => {
  return userController.create(req, res);
});

// ==============================
// Listar todos
// GET /users
// ==============================
userRoutes.get("/", (req, res) => {
  return userController.findAll(req, res);
});

// ==============================
// Buscar por ID
// GET /users/:id
// ==============================
userRoutes.get("/:id", (req, res) => {
  return userController.findById(req, res);
});

// ==============================
// Deletar
// DELETE /users/:id
// ==============================
userRoutes.delete("/:id", (req, res) => {
  return userController.delete(req, res);
});

export { userRoutes };