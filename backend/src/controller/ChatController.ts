import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";

export class ChatController {
  private service = new ChatService();

  // 💬 criar chat privado
  async createPrivate(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { friendId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!friendId) {
        return res.status(400).json({ message: "friendId é obrigatório" });
      }

      const chat = await this.service.createPrivateChat(userId, friendId);
      return res.json(chat);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar chat"
      });
    }
  }

  // 👥 criar grupo
  async createGroup(req: Request, res: Response) {
    try {
      const { name, userIds } = req.body;
      const chat = await this.service.createGroup(name, userIds);
      return res.status(201).json(chat);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar grupo"
      });
    }
  }

  // 📩 enviar mensagem
 async sendMessage(req: Request, res: Response) {
  try {
     console.log("🔥 BODY:", req.body);
  console.log("🔥 USER:", req.user);

    const senderId = req.user?.id;
    const { chatId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!chatId || !content) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const message = await this.service.sendMessage(
      chatId,
      senderId,
      content
    );
    return res.status(201).json({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      
    });
 
  } catch (error) {
    console.error("Erro sendMessage:", error);

    return res.status(500).json({
      message: "Erro ao enviar mensagem"
    });
  }
}
  // 📋 listar chats
  async getChats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const chats = await this.service.getUserChats(userId);
      return res.json(chats);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar chats"
      });
    }
  }

  // 💬 mensagens de um chat
  async getMessages(req: Request, res: Response) {
    try {
      const chatId = String(req.params.chatId);
      const messages = await this.service.getMessages(chatId);
      return res.json(messages);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar mensagens"
      });
    }
  }

  // 🔥 MARCAR COMO LIDA (Corrigido)
  async markAsRead(req: Request, res: Response) {
  try {
    const { chatId } = req.params as { chatId: string };
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    await this.service.markAsRead(chatId, userId);

    return res.status(200).json({ message: "Mensagens lidas." });
  } catch (error) {
    console.error("Erro ao marcar como lida:", error);
    return res.status(500).json({ error: "Erro interno ao processar leitura." });
  }
}
}