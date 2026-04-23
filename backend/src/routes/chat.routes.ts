import { Router } from "express";
import { ChatController } from "../controller/ChatController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new ChatController();

// Todas as rotas de chat exigem autenticação
router.use(authMiddleware);

// 💬 Gerenciamento de Chats (Listagem e Criação)
router.get("/", controller.getChats.bind(controller));
router.post("/private", controller.createPrivate.bind(controller));
router.post("/group", controller.createGroup.bind(controller));

// 👥 Gerenciamento de Membros (Novo)
router.post("/:chatId/add", controller.addMember.bind(controller)); // Adicionar (Só Admin)
router.delete("/:chatId/leave", controller.leaveGroup.bind(controller)); // Sair do grupo
router.post("/:chatId/remove", controller.kickMember.bind(controller));
// 📩 Mensagens
router.post("/message", controller.sendMessage.bind(controller));
router.get("/:chatId/messages", controller.getMessages.bind(controller));
router.post("/:chatId/read", controller.markAsRead.bind(controller));
router.delete("/message/:messageId", controller.deleteMessage.bind(controller));

// 🗑️ Limpar Conversa
router.delete("/:chatId/clear", controller.clearChat.bind(controller));

// 🏋️ Compartilhamento de Treino
router.post("/save-workout", controller.saveWorkout.bind(controller));

// 📊 Info
router.get("/:chatId/info", controller.chatinfo.bind(controller));

export { router };