import { Router } from "express";
import { ChatController } from "../controller/ChatController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
const controller = new ChatController();

// 🔒 TODAS AS ROTAS PROTEGIDAS
router.use(authMiddleware);

// 💬 criar chat privado
router.post("/private", controller.createPrivate.bind(controller));

// 👥 criar grupo
router.post("/group", controller.createGroup.bind(controller));

// 📩 enviar mensagem
router.post("/message", controller.sendMessage.bind(controller));

// 📋 listar chats do usuário
router.get("/", controller.getChats.bind(controller));

// 💬 mensagens de um chat
router.get("/:chatId/messages", controller.getMessages.bind(controller));

// Exemplo
router.post("/:chatId/read", controller.markAsRead.bind(controller))
export { router };