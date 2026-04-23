import { ChatRepository } from "../repository/ChatRepository";
import { prisma } from "../database/prisma";
import { io } from "../../server";

export class ChatService {
  private repo = new ChatRepository();

  // 💬 Criar ou buscar chat privado
  async createPrivateChat(userA: string, userB: string) {
    if (!userA || !userB) throw new Error("Usuários inválidos");
    if (userA === userB) throw new Error("Não pode criar chat com você mesmo");

    const existing = await this.repo.findPrivateChat(userA, userB);
    if (existing) return existing;

    const chat = await this.repo.createChat(false);
    await this.repo.addParticipant(chat.id, userA);
    await this.repo.addParticipant(chat.id, userB);

    return chat;
  }

  // 👥 Criar grupo
  async createGroup(name: string, userIds: string[]) {
    if (!name?.trim()) throw new Error("Nome do grupo é obrigatório");
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("O grupo precisa de participantes");
    }

    const chat = await this.repo.createChat(true, name);

    await Promise.all(
      userIds.map((userId) =>
        this.repo.addParticipant(chat.id, userId)
      )
    );

    // 🚀 opcional → avisar participantes
    userIds.forEach((userId) => {
      io.to(userId).emit("group:created", chat);
    });

    return chat;
  }

 // 📩 ENVIAR MENSAGEM (🔥 PRINCIPAL)
async sendMessage(chatId: string, senderId: string, content: string, workoutId?: string) {
  if (!chatId || !senderId) throw new Error("Parâmetros inválidos");

  if (!content?.trim() && !workoutId) {
    throw new Error("Mensagem vazia");
  }

  const message = await this.repo.createMessage(
    chatId,
    senderId,
    content?.trim(),
    workoutId
  );

  // 🚀🔥 EMITE PARA A SALA DO CHAT
  // Usaremos o nome "chat:new_message" para ser específico
  io.to(chatId).emit("chat:new_message", message);

  return message;
}
  // 📋 Listar chats do usuário
  async getUserChats(userId: string) {
    if (!userId) throw new Error("userId inválido");

    const chatParticipants = await this.repo.findUserChats(userId);

    return chatParticipants.map((c: any) => c.chat);
  }

  // 💬 Buscar mensagens
  async getMessages(chatId: string, userId: string) {
    if (!chatId) throw new Error("chatId inválido");

    await this.repo.updateMessagesToRead(chatId, userId);

    return this.repo.getMessages(chatId);
  }

  // 🔥 Marcar como lido
  async markAsRead(chatId: string, userId: string) {
    if (!chatId || !userId) throw new Error("Parâmetros inválidos");

    const result = await this.repo.updateMessagesToRead(chatId, userId);

    // 🚀 opcional → avisar outros usuários
    io.to(chatId).emit("chat:read", {
      chatId,
      userId
    });

    return result;
  }

  // 🗑️ Limpar histórico
  async clearChatHistory(chatId: string) {
    if (!chatId) throw new Error("chatId inválido");

    const result = await this.repo.deleteChatMessages(chatId);

    // 🚀 tempo real
    io.to(chatId).emit("chat:cleared", chatId);

    return result;
  }

  // 🏋️ Salvar treino compartilhado
  async saveSharedWorkout(targetUserId: string, workoutData: any) {
    if (!workoutData || !workoutData.exercises) {
      throw new Error("Dados do treino incompletos.");
    }

    return await prisma.userWorkout.create({
      data: {
        name: `${workoutData.name} (Importado)`,
        userId: targetUserId,
        exercises: {
          create: workoutData.exercises.map((ex: any) => ({
            exerciseId: ex.exerciseId || ex.exercise?.id,
            sets: Number(ex.sets),
            reps: Number(ex.reps)
          }))
        }
      },
      include: {
        exercises: {
          include: { exercise: true }
        }
      }
    });
  }

  // ❌ Deletar mensagem
  async deleteMessageForEveryone(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) throw new Error("Mensagem não encontrada.");

    if (message.senderId !== userId) {
      throw new Error("Você não tem permissão para apagar esta mensagem.");
    }

    await this.repo.deleteSingleMessage(messageId);

    // 🚀 tempo real
    io.to(message.chatId).emit("chat:delete_message", messageId);

    return { message: "Mensagem apagada" };
  }

  // 📊 Info do chat
  async getchatInfo(chatId: string) {
    const chat = await this.repo.findById(chatId);

    if (!chat) {
      throw new Error("Ops! Esse grupo não foi encontrado.");
    }

    return chat;
  }
}