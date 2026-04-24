import { Router } from "express";
import { addWeightLog, getWeightLogs } from "../controller/WeightController";
import { authMiddleware } from "../middlewares/auth";

const weightRoutes = Router();

weightRoutes.post("/", authMiddleware, addWeightLog);
weightRoutes.get("/", authMiddleware, getWeightLogs);

export { weightRoutes };