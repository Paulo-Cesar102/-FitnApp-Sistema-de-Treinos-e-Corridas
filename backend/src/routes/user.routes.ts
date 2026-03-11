import { Router } from "express";
import { UserController } from "../controller/UserController";

const userRoutes = Router();
const userController = new UserController();

userRoutes.post("/register", (req, res) => {
  return userController.create(req, res);
});


userRoutes.get("/users", (req, res) => {
  return userController.findAll(req, res);
});


userRoutes.get("/user/:id", (req, res) => {
  return userController.findById(req, res);
});


userRoutes.delete("/user/:id", (req, res) => {
  return userController.delete(req, res);
});

export { userRoutes };