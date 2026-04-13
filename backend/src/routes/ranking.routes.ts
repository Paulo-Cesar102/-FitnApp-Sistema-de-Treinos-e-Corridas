import { Router } from "express";
import { RankingController } from "../controller/RankingController";

const rankingRoutes = Router();
const rankingController = new RankingController();

rankingRoutes.get("/", (req, res) => rankingController.getRanking(req, res));

export { rankingRoutes };