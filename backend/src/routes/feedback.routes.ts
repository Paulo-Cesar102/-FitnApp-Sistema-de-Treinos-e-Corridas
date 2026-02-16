import { Router } from "express";
import { FeedbackController } from "../controller/FeedbackController";

const feedbackRoutes = Router();
const feedbackController = new FeedbackController();

feedbackRoutes.post("/", (req, res) => feedbackController.create(req, res));
feedbackRoutes.delete("/:id", (req, res) => feedbackController.delete(req, res));

export { feedbackRoutes };
