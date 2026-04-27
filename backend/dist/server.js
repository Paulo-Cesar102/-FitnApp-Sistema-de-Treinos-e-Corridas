"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const zod_1 = require("zod");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Importação das Rotas
const user_routes_1 = require("./src/routes/user.routes");
const feedback_routes_1 = require("./src/routes/feedback.routes");
const auth_routes_1 = __importDefault(require("./src/routes/auth.routes"));
const auth_gym_routes_1 = __importDefault(require("./src/routes/auth-gym.routes"));
const exercise_routes_1 = __importDefault(require("./src/routes/exercise.routes"));
const workout_routes_1 = require("./src/routes/workout.routes");
const category_routes_1 = __importDefault(require("./src/routes/category.routes"));
const ranking_routes_1 = require("./src/routes/ranking.routes");
const badge_routes_1 = require("./src/routes/badge.routes");
const friendRequest_1 = require("./src/routes/friendRequest");
const chat_routes_1 = require("./src/routes/chat.routes");
const GymRoutes_1 = require("./src/routes/GymRoutes");
const weight_routes_1 = require("./src/routes/weight.routes");
const app = (0, express_1.default)();
// 🔥 Cria servidor HTTP (Essencial para o Socket.io)
const server = http_1.default.createServer(app);
// 🔥 Configuração do Socket.io
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"]
    }
});
// Middleware de CORS para o Express
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Definição das Rotas
app.use("/auth", auth_routes_1.default);
app.use("/auth-gym", auth_gym_routes_1.default);
app.use("/users", user_routes_1.userRoutes);
app.use("/friends", friendRequest_1.router);
app.use("/exercises", exercise_routes_1.default);
app.use("/feedbacks", feedback_routes_1.feedbackRoutes);
app.use("/workouts", workout_routes_1.workoutRoutes);
app.use("/categories", category_routes_1.default);
app.use("/ranking", ranking_routes_1.rankingRoutes);
app.use("/badges", badge_routes_1.badgeRoutes);
app.use("/chats", chat_routes_1.router);
app.use("/gym", GymRoutes_1.gymRoutes);
app.use("/weight", weight_routes_1.weightRoutes);
// Rota de Health Check
app.get("/", (_req, res) => {
    res.json({
        status: "online",
        message: "GymClub Server Ativo 🚀",
    });
});
// 🔥 LÓGICA DO SOCKET.IO (REVISADA)
exports.io.on("connection", (socket) => {
    console.log("🔌 Novo socket conectado:", socket.id);
    /**
     * Identifica o usuário e o coloca em uma sala privativa.
     * Sem isso, o io.to(receiverId) não encontra ninguém.
     */
    socket.on("identify", (userId) => {
        if (userId && userId !== "undefined") {
            // Força a saída de salas antigas se necessário e entra na nova
            socket.join(userId);
            console.log(`🆔 USUÁRIO MAPEADO: User ${userId} está na sala. Socket: ${socket.id}`);
            // Feedback para o front (opcional para debug)
            socket.emit("identified", { status: "success", room: userId });
        }
        else {
            console.log("⚠️ Tentativa de identificação com userId inválido");
        }
    });
    // Entrar em uma sala de chat específica
    socket.on("join_chat", (chatId) => {
        if (chatId) {
            socket.join(chatId);
            console.log(`👥 Socket ${socket.id} entrou no chat ${chatId}`);
        }
    });
    socket.on("leave_chat", (chatId) => {
        socket.leave(chatId);
        console.log(`🚪 Socket ${socket.id} saiu do chat ${chatId}`);
    });
    // --- LÓGICA DE SALAS DA ACADEMIA ---
    socket.on("join_gym_room", (gymId) => {
        if (gymId) {
            socket.join(`gym_${gymId}`);
            console.log(`🏢 Socket ${socket.id} entrou na sala da academia gym_${gymId}`);
        }
    });
    socket.on("leave_gym_room", (gymId) => {
        if (gymId) {
            socket.leave(`gym_${gymId}`);
            console.log(`🚪 Socket ${socket.id} saiu da sala da academia gym_${gymId}`);
        }
    });
    socket.on("new_checkin", (data) => {
        console.log(`📍 Novo checkin na academia ${data.gymId} pelo usuário ${data.userId}`);
        // Repassa o evento para todos na sala da academia para atualizarem o ranking
        exports.io.to(`gym_${data.gymId}`).emit("ranking_updated", { gymId: data.gymId });
    });
    // --- MONITORAMENTO PERSONAL/ALUNO ---
    socket.on("join_personal_room", (personalId) => {
        if (personalId) {
            socket.join(`personal_${personalId}`);
            console.log(`👨‍🏫 Personal ${personalId} ouvindo atualizações de seus alunos`);
        }
    });
    socket.on("student_activity", (data) => {
        console.log(`🏋️ Atividade do Aluno: ${data.studentName} em ${data.workoutName} (${data.status})`);
        // Notifica apenas o personal deste aluno
        exports.io.to(`personal_${data.personalId}`).emit("live_activity", data);
    });
    socket.on("student_enrolled", (data) => {
        console.log(`👥 Novo aluno inscrito para o personal ${data.personalId}`);
        exports.io.to(`personal_${data.personalId}`).emit("new_student_joined");
    });
    socket.on("disconnect", () => {
        console.log("❌ Socket desconectado:", socket.id);
    });
});
// 🔥 TRATAMENTO DE ERRO GLOBAL
app.use((err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
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
