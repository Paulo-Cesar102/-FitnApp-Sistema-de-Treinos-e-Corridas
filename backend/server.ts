import express from "express";
import cors from "cors";
import "dotenv/config"; 

import { userRoutes } from "./src/routes/user.routes";
import { feedbackRoutes } from "./src/routes/feedback.routes";
import authRoutes from "./src/routes/auth.routes";
import exerciseRoutes from "./src/routes/exercise.routes";
import { workoutRoutes } from "./src/routes/workout.routes";
import categoryRoutes from "./src/routes/category.routes"; 
import { rankingRoutes } from "./src/routes/ranking.routes";
import { badgeRoutes } from "./src/routes/badge.routes";  
import { router as friendRoutes } from "./src/routes/friendRequest";
import { router as chatRoutes } from "./src/routes/chat.routes";

const app = express();

// 🔐 CORS CONFIGURADO (Corrigido para evitar bloqueios no frontend)
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 📦 JSON
app.use(express.json());

// 🧭 ROTAS (Limpas e sem duplicatas)
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/friends", friendRoutes); 
app.use("/exercises", exerciseRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/workouts", workoutRoutes);
app.use("/categories", categoryRoutes);
app.use("/ranking", rankingRoutes);
app.use("/badges", badgeRoutes);
app.use("/chats", chatRoutes);

app.get("/", (_req, res) => {
  res.json({
    status: "online",
    message: "GymClub Server Ativo 🚀"
  });
});

// 🚨 MIDDLEWARE GLOBAL DE ERRO
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("🔥 ERRO GLOBAL:", err);
  return res.status(500).json({
    message: "Erro interno do servidor"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});