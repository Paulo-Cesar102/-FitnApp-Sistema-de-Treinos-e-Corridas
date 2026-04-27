import { Router } from "express";
import GymController from "../controller/GymController";
import { GymPersonalController } from "../controller/GymPersonalController";
import { CheckInController } from "../controller/CheckInController";
import { GymAnnouncementController } from "../controller/GymAnnouncementController";
import { GymRankingController } from "../controller/GymRankingController";
import { authMiddleware } from "../middlewares/auth";
import { roleMiddleware } from "../middlewares/role";

const gymRoutes = Router();
const gymControllerRoutes = new GymController();
const gymPersonalController = new GymPersonalController();
const checkInController = new CheckInController();
const announcementController = new GymAnnouncementController();
const rankingController = new GymRankingController();

const adminOrOwner = roleMiddleware(["ADMIN", "GYM_OWNER"]);

// ========================
// GYM ROUTES
// ========================
gymRoutes.post("/register", authMiddleware, gymControllerRoutes.create);
gymRoutes.post("/join", authMiddleware, gymControllerRoutes.join);
gymRoutes.get("/search", authMiddleware, gymControllerRoutes.search.bind(gymControllerRoutes));

// ========================
// GYM PERSONAL ROUTES
// ========================
gymRoutes.post(
  "/personal/create",
  authMiddleware,
  adminOrOwner,
  gymPersonalController.createPersonal.bind(gymPersonalController)
);
gymRoutes.get(
  "/personal/:personalId",
  authMiddleware,
  gymPersonalController.getPersonalById.bind(gymPersonalController)
);
gymRoutes.get(
  "/personal/user/:userId",
  authMiddleware,
  gymPersonalController.getPersonalByUserId.bind(gymPersonalController)
);
gymRoutes.get(
  "/gym/:gymId/personals",
  authMiddleware,
  gymPersonalController.getGymPersonals.bind(gymPersonalController)
);
gymRoutes.put(
  "/personal/:personalId",
  authMiddleware,
  adminOrOwner,
  gymPersonalController.updatePersonal.bind(gymPersonalController)
);
gymRoutes.delete(
  "/personal/:personalId",
  authMiddleware,
  adminOrOwner,
  gymPersonalController.deletePersonal.bind(gymPersonalController)
);

// Personal Students
gymRoutes.post(
  "/personal/student/assign",
  authMiddleware,
  roleMiddleware(["ADMIN", "GYM_OWNER", "PERSONAL"]),
  gymPersonalController.assignStudent.bind(gymPersonalController)
);
gymRoutes.delete(
  "/personal/:personalId/student/:studentId",
  authMiddleware,
  roleMiddleware(["ADMIN", "GYM_OWNER", "PERSONAL"]),
  gymPersonalController.removeStudent.bind(gymPersonalController)
);
gymRoutes.get(
  "/personal/:personalId/students",
  authMiddleware,
  gymPersonalController.getStudents.bind(gymPersonalController)
);

// Personal Support Chats
gymRoutes.post(
  "/personal/chat/support",
  authMiddleware,
  gymPersonalController.createSupportChat.bind(gymPersonalController)
);
gymRoutes.get(
  "/personal/:personalId/chats",
  authMiddleware,
  gymPersonalController.getSupportChats.bind(gymPersonalController)
);

// ========================
// CHECK-IN ROUTES
// ========================
gymRoutes.post(
  "/checkin",
  authMiddleware,
  checkInController.performCheckIn.bind(checkInController)
);
gymRoutes.get(
  "/checkin/:userId/:gymId",
  authMiddleware,
  checkInController.getUserCheckIns.bind(checkInController)
);
gymRoutes.get(
  "/checkin/gym/:gymId",
  authMiddleware,
  checkInController.getGymCheckIns.bind(checkInController)
);
gymRoutes.get(
  "/checkin/count/:gymId",
  authMiddleware,
  checkInController.getTodayCheckInCount.bind(checkInController)
);
gymRoutes.get(
  "/checkin/streak/:userId/:gymId",
  authMiddleware,
  checkInController.getCheckInStreak.bind(checkInController)
);
gymRoutes.get(
  "/checkin/monthly/:userId/:gymId",
  authMiddleware,
  checkInController.getMonthlyCheckInCount.bind(checkInController)
);

// ========================
// ANNOUNCEMENT ROUTES
// ========================
gymRoutes.post(
  "/announcement",
  authMiddleware,
  adminOrOwner,
  announcementController.createAnnouncement.bind(announcementController)
);
gymRoutes.get(
  "/announcement/:announcementId",
  authMiddleware,
  announcementController.getAnnouncementById.bind(announcementController)
);
gymRoutes.get(
  "/announcement/gym/:gymId",
  authMiddleware,
  announcementController.getGymAnnouncements.bind(announcementController)
);
gymRoutes.put(
  "/announcement/:announcementId",
  authMiddleware,
  adminOrOwner,
  announcementController.updateAnnouncement.bind(announcementController)
);
gymRoutes.delete(
  "/announcement/:announcementId",
  authMiddleware,
  adminOrOwner,
  announcementController.deleteAnnouncement.bind(announcementController)
);
gymRoutes.get(
  "/announcement/urgent/:gymId",
  authMiddleware,
  announcementController.getUrgentAnnouncements.bind(announcementController)
);

// ========================
// GYM RANKING ROUTES
// ========================
gymRoutes.get(
  "/ranking/:gymId/top10",
  authMiddleware,
  rankingController.getTop10Ranking.bind(rankingController)
);
gymRoutes.get(
  "/ranking/:gymId/stats",
  authMiddleware,
  rankingController.getRankingStats.bind(rankingController)
);
gymRoutes.get(
  "/ranking/:gymId",
  authMiddleware,
  rankingController.getGymRanking.bind(rankingController)
);
gymRoutes.get(
  "/ranking/:userId/:gymId/position",
  authMiddleware,
  rankingController.getUserRankPosition.bind(rankingController)
);
gymRoutes.get(
  "/ranking/:userId/:gymId",
  authMiddleware,
  rankingController.getUserRank.bind(rankingController)
);

export { gymRoutes };
