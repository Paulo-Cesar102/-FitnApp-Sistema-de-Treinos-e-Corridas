import { Router } from "express";
import { BadgeController } from "../controller/BadgeController";
import { authMiddleware } from "../middlewares/auth";

const badgeRoutes = Router();
const badgeController = new BadgeController();

badgeRoutes.get("/", (req, res) => badgeController.listAll(req, res));
badgeRoutes.get("/me", authMiddleware, (req, res) =>
  badgeController.listMyBadges(req, res)
);

export { badgeRoutes };