"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GymAuthController_1 = require("../controller/GymAuthController");
const GymOwnerController_1 = require("../controller/GymOwnerController");
const auth_1 = require("../middlewares/auth");
const authRoutes = (0, express_1.Router)();
const gymAuthController = new GymAuthController_1.GymAuthController();
const gymOwnerController = new GymOwnerController_1.GymOwnerController();
// =========================
// PUBLIC ROUTES (Sem autenticação)
// =========================
/**
 * Registra um novo usuário em uma academia
 * POST /api/auth/register/user
 */
authRoutes.post("/register/user", (req, res) => gymAuthController.registerUserInGym(req, res));
/**
 * Registra um novo proprietário de academia
 * POST /api/auth/register/gym-owner
 */
authRoutes.post("/register/gym-owner", (req, res) => gymAuthController.registerGymOwner(req, res));
/**
 * Login com email e senha
 * POST /api/auth/login
 */
authRoutes.post("/login", (req, res) => gymAuthController.login(req, res));
/**
 * Valida se uma academia existe
 * GET /api/auth/gym/:gymId
 */
authRoutes.get("/gym/:gymId", (req, res) => gymAuthController.validateGym(req, res));
// =========================
// PROTECTED ROUTES (Com autenticação)
// =========================
/**
 * Cadastra um novo personal na academia
 * POST /api/owner/:gymId/personals
 */
authRoutes.post("/owner/:gymId/personals", auth_1.authMiddleware, (req, res) => gymOwnerController.createPersonal(req, res));
/**
 * Lista personals da academia
 * GET /api/owner/:gymId/personals
 */
authRoutes.get("/owner/:gymId/personals", auth_1.authMiddleware, (req, res) => gymOwnerController.listPersonals(req, res));
/**
 * Deleta um personal
 * DELETE /api/owner/:gymId/personals/:personalId
 */
authRoutes.delete("/owner/:gymId/personals/:personalId", auth_1.authMiddleware, (req, res) => gymOwnerController.deletePersonal(req, res));
/**
 * Obtém estatísticas da academia
 * GET /api/owner/:gymId/stats
 */
authRoutes.get("/owner/:gymId/stats", auth_1.authMiddleware, (req, res) => gymOwnerController.getStats(req, res));
exports.default = authRoutes;
