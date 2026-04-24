"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingRoutes = void 0;
const express_1 = require("express");
const RankingController_1 = require("../controller/RankingController");
const rankingRoutes = (0, express_1.Router)();
exports.rankingRoutes = rankingRoutes;
const rankingController = new RankingController_1.RankingController();
rankingRoutes.get("/", (req, res) => rankingController.getRanking(req, res));
