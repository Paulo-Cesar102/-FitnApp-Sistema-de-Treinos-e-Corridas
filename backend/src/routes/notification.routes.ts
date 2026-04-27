import { Router } from "express";
import { NotificationController } from "../controller/NotificationController";
import { authMiddleware } from "../middlewares/auth";

const notificationRoutes = Router();
const controller = new NotificationController();

notificationRoutes.get("/", authMiddleware, controller.list.bind(controller));
notificationRoutes.put("/:id/read", authMiddleware, controller.markRead.bind(controller));
notificationRoutes.put("/read-all", authMiddleware, controller.markAllRead.bind(controller));
notificationRoutes.delete("/:id", authMiddleware, controller.delete.bind(controller));

export { notificationRoutes };