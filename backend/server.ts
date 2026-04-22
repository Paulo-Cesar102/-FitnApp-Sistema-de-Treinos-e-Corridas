import express from "express";
import cors from "cors";
import "dotenv/config";
import { ZodError } from "zod"; // Importante para capturar erros de validação

// Importação das suas rotas
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
import { gymRoutes } from "./src/routes/GymRoutes";

const app = express();

// 🔐 CONFIGURAÇÃO DE CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 📦 MIDDLEWARE PARA JSON
app.use(express.json());

// 🚀 DEFINIÇÃO DAS ROTAS
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
app.use("/gym", gymRoutes);

// Rota de check do servidor
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    message: "GymClub Server Ativo 🚀",
  });
});

// 🛠️ MIDDLEWARE DE ERRO GLOBAL (A MÁGICA ACONTECE AQUI)
app.use((err: any, _req: any, res: any, _next: any) => {
  // Se o erro vier do Zod (Validação)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Erro de validação",
      // Usamos o format() ou flatten() que são métodos padrão do ZodError
      errors: err.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1],
        message: issue.message,
      })),
    });
  }

  // Se for erro de banco de dados ou erro de código (500)
  console.error("🔥 ERRO GLOBAL:", err);
  return res.status(500).json({
    message: "Erro interno do servidor",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});