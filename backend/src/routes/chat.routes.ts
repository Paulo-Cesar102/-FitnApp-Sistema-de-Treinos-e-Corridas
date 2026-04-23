import { Router } from "express";
import { ChatController } from "../controller/ChatController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new ChatController();

// Todas as rotas de chat exigem autenticação
router.use(authMiddleware);

// 💬 Gerenciamento de Chats
router.post("/private", controller.createPrivate.bind(controller));
router.post("/group", controller.createGroup.bind(controller));
router.get("/", controller.getChats.bind(controller));

// 📩 Mensagens
router.post("/message", controller.sendMessage.bind(controller));
router.get("/:chatId/messages", controller.getMessages.bind(controller));
router.post("/:chatId/read", controller.markAsRead.bind(controller));

// 🗑️ Limpar Conversa (Delete para todos)
router.delete("/:chatId/clear", controller.clearChat.bind(controller));

// 🏋️ Compartilhamento de Treino
// Rota para quando o usuário clicar em "Salvar" no card de treino dentro do chat
router.post("/save-workout", controller.saveWorkout.bind(controller));

router.delete("/message/:messageId", controller.deleteMessage.bind(controller));

router.get("/:chatId/info", controller.chatinfo.bind(controller));
export { router };