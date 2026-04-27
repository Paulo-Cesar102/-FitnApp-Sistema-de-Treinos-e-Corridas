import { Router } from "express";
import { GymAuthController } from "../controller/GymAuthController";
import { GymOwnerController } from "../controller/GymOwnerController";
import { authMiddleware } from "../middlewares/auth";

const authRoutes = Router();
const gymAuthController = new GymAuthController();
const gymOwnerController = new GymOwnerController();

// =========================
// PUBLIC ROUTES (Sem autenticação)
// =========================

/**
 * Registra um novo usuário em uma academia
 * POST /api/auth/register/user
 */
authRoutes.post("/register/user", (req, res) =>
  gymAuthController.registerUserInGym(req, res)
);

/**
 * Registra um novo proprietário de academia
 * POST /api/auth/register/gym-owner
 */
authRoutes.post("/register/gym-owner", (req, res) =>
  gymAuthController.registerGymOwner(req, res)
);

/**
 * Login com email e senha
 * POST /api/auth/login
 */
authRoutes.post("/login", (req, res) =>
  gymAuthController.login(req, res)
);

/**
 * Valida se uma academia existe
 * GET /api/auth/gym/:gymId
 */
authRoutes.get("/gym/:gymId", (req, res) =>
  gymAuthController.validateGym(req, res)
);

// =========================
// PROTECTED ROUTES (Com autenticação)
// =========================

/**
 * Cadastra um novo personal na academia
 * POST /api/owner/:gymId/personals
 */
authRoutes.post(
  "/owner/:gymId/personals",
  authMiddleware,
  (req, res) => gymOwnerController.createPersonal(req, res)
);

/**
 * Lista personals da academia
 * GET /api/owner/:gymId/personals
 */
authRoutes.get(
  "/owner/:gymId/personals",
  authMiddleware,
  (req, res) => gymOwnerController.listPersonals(req, res)
);

/**
 * Lista membros (alunos) da academia
 * GET /api/owner/:gymId/members
 */
authRoutes.get(
  "/owner/:gymId/members",
  authMiddleware,
  (req, res) => gymOwnerController.listMembers(req, res)
);

/**
 * Deleta um personal
 * DELETE /api/owner/:gymId/personals/:personalId
 */
authRoutes.delete(
  "/owner/:gymId/personals/:personalId",
  authMiddleware,
  (req, res) => gymOwnerController.deletePersonal(req, res)
);

/**
 * Obtém estatísticas da academia
 * GET /api/owner/:gymId/stats
 */
authRoutes.get(
  "/owner/:gymId/stats",
  authMiddleware,
  (req, res) => gymOwnerController.getStats(req, res)
);

export default authRoutes;
