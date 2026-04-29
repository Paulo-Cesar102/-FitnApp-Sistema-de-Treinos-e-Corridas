import express from "express";
import cors from "cors";
import "dotenv/config";
import { ZodError } from "zod";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// Importação das Rotas
import { userRoutes } from "./src/routes/user.routes";
import { feedbackRoutes } from "./src/routes/feedback.routes";
import authRoutes from "./src/routes/auth.routes";
import authGymRoutes from "./src/routes/auth-gym.routes";
import exerciseRoutes from "./src/routes/exercise.routes";
import { workoutRoutes } from "./src/routes/workout.routes";
import categoryRoutes from "./src/routes/category.routes";
import { rankingRoutes } from "./src/routes/ranking.routes";
import { badgeRoutes } from "./src/routes/badge.routes";
import { router as friendRoutes } from "./src/routes/friendRequest";
import { router as chatRoutes } from "./src/routes/chat.routes";
import { gymRoutes } from "./src/routes/GymRoutes";
import { weightRoutes } from "./src/routes/weight.routes";
import { notificationRoutes } from "./src/routes/notification.routes"; // 🔥 Adicionado
import { smartCoachRoutes } from "./src/routes/smartcoach.routes";

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

// 🔥 Middleware de Autenticação para Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, "segredo-super-secreto") as any;
    (socket as any).userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
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
app.use("/auth-gym", authGymRoutes);
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
app.use("/weight", weightRoutes);
app.use("/notifications", notificationRoutes); // 🔥 Adicionado
app.use("/smart-coach", smartCoachRoutes);

// Rota de Health Check
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    message: "GymClub Server Ativo 🚀",
  });
});

// 🔥 LÓGICA DO SOCKET.IO (REVISADA)
io.on("connection", (socket) => {
  const authenticatedUserId = (socket as any).userId;
  console.log("🔌 Novo socket autenticado conectado:", socket.id, "User:", authenticatedUserId);

  /**
   * Identifica o usuário e o coloca em uma sala privativa.
   * Agora validamos se o userId enviado no identify bate com o do token.
   */
  socket.on("identify", (userId: string) => {
    if (userId && userId === authenticatedUserId) {
      // Força a saída de salas antigas se necessário e entra na nova
      socket.join(userId);
      console.log(`🆔 USUÁRIO MAPEADO: User ${userId} está na sala. Socket: ${socket.id}`);
      
      // Feedback para o front (opcional para debug)
      socket.emit("identified", { status: "success", room: userId });
    } else {
      console.log("⚠️ Tentativa de identificação com userId inválido ou não autorizado");
      socket.emit("error", { message: "Não autorizado" });
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

  // --- LÓGICA DE SALAS DA ACADEMIA ---
  socket.on("join_gym_room", (gymId: string) => {
    if (gymId) {
      socket.join(`gym_${gymId}`);
      console.log(`🏢 Socket ${socket.id} entrou na sala da academia gym_${gymId}`);
    }
  });

  socket.on("leave_gym_room", (gymId: string) => {
    if (gymId) {
      socket.leave(`gym_${gymId}`);
      console.log(`🚪 Socket ${socket.id} saiu da sala da academia gym_${gymId}`);
    }
  });

  socket.on("new_checkin", (data: { gymId: string, userId: string }) => {
    console.log(`📍 Novo checkin na academia ${data.gymId} pelo usuário ${data.userId}`);
    // Repassa o evento para todos na sala da academia para atualizarem o ranking
    io.to(`gym_${data.gymId}`).emit("ranking_updated", { gymId: data.gymId });
  });

  // --- MONITORAMENTO PERSONAL/ALUNO ---
  socket.on("join_personal_room", (personalId: string) => {
    if (personalId) {
      socket.join(`personal_${personalId}`);
      console.log(`👨‍🏫 Personal ${personalId} ouvindo atualizações de seus alunos`);
    }
  });

  socket.on("student_activity", (data: { personalId: string, studentName: string, workoutName: string, status: "started" | "completed", xpGained?: number }) => {
    console.log(`🏋️ Atividade do Aluno: ${data.studentName} em ${data.workoutName} (${data.status})`);
    // Notifica apenas o personal deste aluno
    io.to(`personal_${data.personalId}`).emit("live_activity", data);
  });

  socket.on("student_enrolled", (data: { personalId: string }) => {
    console.log(`👥 Novo aluno inscrito para o personal ${data.personalId}`);
    io.to(`personal_${data.personalId}`).emit("new_student_joined");
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