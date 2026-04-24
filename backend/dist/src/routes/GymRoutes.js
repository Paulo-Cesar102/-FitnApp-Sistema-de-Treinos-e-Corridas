"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gymRoutes = void 0;
const express_1 = require("express");
const GymController_1 = __importDefault(require("../controller/GymController"));
const GymPersonalController_1 = require("../controller/GymPersonalController");
const CheckInController_1 = require("../controller/CheckInController");
const GymAnnouncementController_1 = require("../controller/GymAnnouncementController");
const GymRankingController_1 = require("../controller/GymRankingController");
const auth_1 = require("../middlewares/auth");
const gymRoutes = (0, express_1.Router)();
exports.gymRoutes = gymRoutes;
const gymControllerRoutes = new GymController_1.default();
const gymPersonalController = new GymPersonalController_1.GymPersonalController();
const checkInController = new CheckInController_1.CheckInController();
const announcementController = new GymAnnouncementController_1.GymAnnouncementController();
const rankingController = new GymRankingController_1.GymRankingController();
// ========================
// GYM ROUTES
// ========================
gymRoutes.post("/register", auth_1.authMiddleware, gymControllerRoutes.create);
gymRoutes.post("/join", auth_1.authMiddleware, gymControllerRoutes.join);
gymRoutes.get("/search", auth_1.authMiddleware, gymControllerRoutes.search.bind(gymControllerRoutes));
// ========================
// GYM PERSONAL ROUTES
// ========================
gymRoutes.post("/personal/create", auth_1.authMiddleware, gymPersonalController.createPersonal.bind(gymPersonalController));
gymRoutes.get("/personal/:personalId", auth_1.authMiddleware, gymPersonalController.getPersonalById.bind(gymPersonalController));
gymRoutes.get("/personal/user/:userId", auth_1.authMiddleware, gymPersonalController.getPersonalByUserId.bind(gymPersonalController));
gymRoutes.get("/gym/:gymId/personals", auth_1.authMiddleware, gymPersonalController.getGymPersonals.bind(gymPersonalController));
gymRoutes.put("/personal/:personalId", auth_1.authMiddleware, gymPersonalController.updatePersonal.bind(gymPersonalController));
gymRoutes.delete("/personal/:personalId", auth_1.authMiddleware, gymPersonalController.deletePersonal.bind(gymPersonalController));
// Personal Students
gymRoutes.post("/personal/student/assign", auth_1.authMiddleware, gymPersonalController.assignStudent.bind(gymPersonalController));
gymRoutes.delete("/personal/:personalId/student/:studentId", auth_1.authMiddleware, gymPersonalController.removeStudent.bind(gymPersonalController));
gymRoutes.get("/personal/:personalId/students", auth_1.authMiddleware, gymPersonalController.getStudents.bind(gymPersonalController));
// Personal Support Chats
gymRoutes.post("/personal/chat/support", auth_1.authMiddleware, gymPersonalController.createSupportChat.bind(gymPersonalController));
gymRoutes.get("/personal/:personalId/chats", auth_1.authMiddleware, gymPersonalController.getSupportChats.bind(gymPersonalController));
// ========================
// CHECK-IN ROUTES
// ========================
gymRoutes.post("/checkin", auth_1.authMiddleware, checkInController.performCheckIn.bind(checkInController));
gymRoutes.get("/checkin/:userId/:gymId", auth_1.authMiddleware, checkInController.getUserCheckIns.bind(checkInController));
gymRoutes.get("/checkin/gym/:gymId", auth_1.authMiddleware, checkInController.getGymCheckIns.bind(checkInController));
gymRoutes.get("/checkin/count/:gymId", auth_1.authMiddleware, checkInController.getTodayCheckInCount.bind(checkInController));
gymRoutes.get("/checkin/streak/:userId/:gymId", auth_1.authMiddleware, checkInController.getCheckInStreak.bind(checkInController));
gymRoutes.get("/checkin/monthly/:userId/:gymId", auth_1.authMiddleware, checkInController.getMonthlyCheckInCount.bind(checkInController));
// ========================
// ANNOUNCEMENT ROUTES
// ========================
gymRoutes.post("/announcement", auth_1.authMiddleware, announcementController.createAnnouncement.bind(announcementController));
gymRoutes.get("/announcement/:announcementId", auth_1.authMiddleware, announcementController.getAnnouncementById.bind(announcementController));
gymRoutes.get("/announcement/gym/:gymId", auth_1.authMiddleware, announcementController.getGymAnnouncements.bind(announcementController));
gymRoutes.put("/announcement/:announcementId", auth_1.authMiddleware, announcementController.updateAnnouncement.bind(announcementController));
gymRoutes.delete("/announcement/:announcementId", auth_1.authMiddleware, announcementController.deleteAnnouncement.bind(announcementController));
gymRoutes.get("/announcement/urgent/:gymId", auth_1.authMiddleware, announcementController.getUrgentAnnouncements.bind(announcementController));
// ========================
// GYM RANKING ROUTES
// ========================
gymRoutes.get("/ranking/:gymId", auth_1.authMiddleware, rankingController.getGymRanking.bind(rankingController));
gymRoutes.get("/ranking/:gymId/top10", auth_1.authMiddleware, rankingController.getTop10Ranking.bind(rankingController));
gymRoutes.get("/ranking/:userId/:gymId", auth_1.authMiddleware, rankingController.getUserRank.bind(rankingController));
gymRoutes.get("/ranking/:userId/:gymId/position", auth_1.authMiddleware, rankingController.getUserRankPosition.bind(rankingController));
gymRoutes.get("/ranking/:gymId/stats", auth_1.authMiddleware, rankingController.getRankingStats.bind(rankingController));
