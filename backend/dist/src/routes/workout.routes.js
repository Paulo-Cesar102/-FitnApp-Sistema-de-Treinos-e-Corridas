"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutRoutes = void 0;
const express_1 = require("express");
const WorkoutController_1 = require("../controller/WorkoutController");
const auth_1 = require("../middlewares/auth");
const workoutRoutes = (0, express_1.Router)();
exports.workoutRoutes = workoutRoutes;
const workoutController = new WorkoutController_1.WorkoutController();
// CATÁLOGO
workoutRoutes.get("/catalog", (req, res) => workoutController.getCatalog(req, res));
// TREINOS DO USUÁRIO LOGADO
workoutRoutes.get("/user", auth_1.authMiddleware, (req, res) => workoutController.getUserWorkouts(req, res));
// TREINOS DE UM USUÁRIO ESPECÍFICO (ex: personal)
workoutRoutes.get("/user/:userId", auth_1.authMiddleware, (req, res) => workoutController.getWorkoutsByUserId(req, res));
// CRIAR TREINO
workoutRoutes.post("/", auth_1.authMiddleware, (req, res) => workoutController.create(req, res));
// ATUALIZAR TREINO
workoutRoutes.put("/:id", auth_1.authMiddleware, (req, res) => workoutController.update(req, res));
// COMPLETAR TREINO INTEIRO
workoutRoutes.post("/complete", auth_1.authMiddleware, (req, res) => workoutController.complete(req, res));
// COMPLETAR EXERCÍCIO INDIVIDUAL
workoutRoutes.post("/complete-exercise", auth_1.authMiddleware, (req, res) => workoutController.completeExercise(req, res));
// ESTATÍSTICAS: Distribuição de foco por grupo muscular (Gráfico de Pizza)
workoutRoutes.get("/stats/focus", auth_1.authMiddleware, (req, res) => workoutController.getFocusStats(req, res));
// ESTATÍSTICAS: Volume de treinos realizados na semana atual (Gráfico de Barras)
workoutRoutes.get("/stats/weekly", auth_1.authMiddleware, (req, res) => workoutController.getWeeklyStats(req, res));
// DELETAR TREINO
workoutRoutes.delete("/:id", auth_1.authMiddleware, (req, res) => workoutController.delete(req, res));
