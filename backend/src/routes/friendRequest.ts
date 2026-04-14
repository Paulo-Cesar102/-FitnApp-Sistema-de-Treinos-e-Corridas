import { Router } from "express";
import { FriendRequestController } from "../controller/FriendRequestController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new FriendRequestController();


router.post("/request", authMiddleware, controller.send.bind(controller));
router.post("/accept", authMiddleware, controller.accept.bind(controller));
router.post("/reject", authMiddleware, controller.reject.bind(controller));
router.get("/", authMiddleware, controller.friends.bind(controller));
router.get("/pending", authMiddleware, controller.pending.bind(controller));
router.delete("/:id", authMiddleware, controller.delete.bind(controller));
router.get("/search", authMiddleware, controller.search.bind(controller));

export { router };