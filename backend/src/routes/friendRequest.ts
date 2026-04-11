import { Router } from "express";
import { FriendRequestController } from "../controller/FriendRequestController";

const router = Router();
const controller = new FriendRequestController();

// amizade
router.post("/friends/request", controller.send.bind(controller));
router.post("/friends/accept", controller.accept.bind(controller));
router.post("/friends/reject", controller.reject.bind(controller));
router.get("/friends", controller.friends.bind(controller));
router.get("/friends/pending", controller.pending.bind(controller));

export { router };