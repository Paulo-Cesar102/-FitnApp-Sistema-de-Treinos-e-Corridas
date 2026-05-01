import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";
import { io } from "../../server";

export class ChatController {
  private service = new ChatService();

  // 💬 Criar chat privado
  async createPrivate(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { friendId } = req.body;

      if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });
      if (!friendId) return res.status(400).json({ message: "friendId é obrigatório" });

      const chat = await this.service.createPrivateChat(userId, friendId);
      return res.json(chat);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar chat"
      });
    }
  }

  // 👥 Criar grupo (Criador vira ADMIN)
  async createGroup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { name, userIds } = req.body;

      if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });
      if (!name?.trim()) return res.status(400).json({ message: "Nome do grupo é obrigatório" });
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "O grupo precisa de participantes" });
      }

      // Passamos o userId (criador) separado para o service definir como ADMIN
      const chat = await this.service.createGroup(name, userId, userIds);
      return res.status(201).json(chat);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao criar grupo"
      });
    }
  }

  async kickMember(req: Request, res: Response) {
  try {
    const adminId = req.user?.id;
    const { chatId } = req.params as { chatId: string };
    const { memberId } = req.body; 

    if (!adminId) return res.status(401).json({ message: "Não autorizado" });

    await this.service.removeMember(chatId, adminId, memberId);
    return res.status(200).json({ message: "Membro removido com sucesso." });
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
}

  // ➕ Adicionar membro (Apenas ADMIN)
  async addMember(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const { chatId } = req.params as { chatId: string };
      const { newMemberId } = req.body;

      if (!adminId) return res.status(401).json({ message: "Não autorizado" });

      const participant = await this.service.addMember(chatId, adminId, newMemberId);
      return res.status(201).json(participant);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao adicionar membro"
      });
    }
  }

  // 🚪 Sair do grupo
  async leaveGroup(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { chatId } = req.params as { chatId: string };

      if (!userId) return res.status(401).json({ message: "Não autorizado" });

      const result = await this.service.leaveGroup(chatId, userId);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao sair do grupo"
      });
    }
  }

  // 📩 Enviar mensagem
  async sendMessage(req: Request, res: Response) {
    try {
      const senderId = req.user?.id;
      const { chatId, content, workoutId } = req.body;

      if (!senderId) return res.status(401).json({ message: "Usuário não autenticado" });
      if (!chatId) return res.status(400).json({ message: "chatId é obrigatório" });

      const message = await this.service.sendMessage(chatId, senderId, content, workoutId);

      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro ao enviar mensagem"
      });
    }
  }

  // 📋 Listar chats do usuário
  async getChats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });

      const chats = await this.service.getUserChats(userId);
      return res.json(chats);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar chats"
      });
    }
  }

  // 💬 Buscar mensagens
  async getMessages(req: Request, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ message: "Não autenticado" });

      const messages = await this.service.getMessages(chatId, userId);
      return res.json(messages);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar mensagens"
      });
    }
  }

  // 🔥 Marcar como lida
  async markAsRead(req: Request, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ error: "Não autorizado" });

      await this.service.markAsRead(chatId, userId);
      return res.status(200).json({ message: "Mensagens lidas." });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao processar leitura." });
    }
  }

  // 🗑️ Limpar histórico
  async clearChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      await this.service.clearChatHistory(chatId);
      return res.json({ message: "Histórico limpo com sucesso." });
    } catch (error) {
      return res.status(400).json({ message: "Erro ao limpar histórico." });
    }
  }

  // 🗑️ Excluir chat/grupo (Apenas ADMIN)
  async deleteChat(req: Request, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ message: "Não autorizado" });

      await this.service.deleteChat(chatId, userId);
      return res.json({ message: "Grupo excluído com sucesso." });
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao excluir grupo"
      });
    }
  }

  // 🏋️ Salvar Treino
  async saveWorkout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { workoutData } = req.body;

      if (!userId) return res.status(401).json({ message: "Não autenticado" });

      const newWorkout = await this.service.saveSharedWorkout(userId, workoutData);
      return res.status(201).json(newWorkout);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao salvar treino"
      });
    }
  }

  // ❌ Apagar mensagem
  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params as { messageId: string };
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ message: "Não autorizado" });

      await this.service.deleteMessageForEveryone(messageId, userId);
      return res.json({ message: "Mensagem apagada para todos." });
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao apagar mensagem."
      });
    }
  }

  // 📊 Informações do chat
  async chatinfo(req: Request, res: Response) {
    try {
      const { chatId } = req.params as { chatId: string };
      const chat = await this.service.getchatInfo(chatId);
      return res.json(chat);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar informações do chat."
      });
    }
  }
}