import express from "express";
import cors from "cors";
import "dotenv/config";
import { ZodError } from "zod";
import http from "http";
import { Server } from "socket.io";

// Importação das Rotas
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

// 🔥 Cria servidor HTTP (Essencial para o Socket.io)
const server = http.createServer(app);

// 🔥 Configuração do Socket.io
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

// Middleware de CORS para o Express
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Definição das Rotas
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

// Rota de Health Check
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    message: "GymClub Server Ativo 🚀",
  });
});

// 🔥 LÓGICA DO SOCKET.IO (REVISADA)
io.on("connection", (socket) => {
  console.log("🔌 Novo socket conectado:", socket.id);

  /**
   * Identifica o usuário e o coloca em uma sala privativa.
   * Sem isso, o io.to(receiverId) não encontra ninguém.
   */
  socket.on("identify", (userId: string) => {
    if (userId && userId !== "undefined") {
      // Força a saída de salas antigas se necessário e entra na nova
      socket.join(userId);
      console.log(`🆔 USUÁRIO MAPEADO: User ${userId} está na sala. Socket: ${socket.id}`);
      
      // Feedback para o front (opcional para debug)
      socket.emit("identified", { status: "success", room: userId });
    } else {
      console.log("⚠️ Tentativa de identificação com userId inválido");
    }
  });

  // Entrar em uma sala de chat específica
  socket.on("join_chat", (chatId: string) => {
    if (chatId) {
      socket.join(chatId);
      console.log(`👥 Socket ${socket.id} entrou no chat ${chatId}`);
    }
  });

  socket.on("leave_chat", (chatId: string) => {
    socket.leave(chatId);
    console.log(`🚪 Socket ${socket.id} saiu do chat ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket desconectado:", socket.id);
  });
});

// 🔥 TRATAMENTO DE ERRO GLOBAL
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Erro de validação",
      errors: err.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1],
        message: issue.message,
      })),
    });
  }

  console.error("🔥 ERRO GLOBAL:", err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    message: err.message || "Erro interno do servidor",
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 GymClub rodando em: http://localhost:${PORT}`);
});