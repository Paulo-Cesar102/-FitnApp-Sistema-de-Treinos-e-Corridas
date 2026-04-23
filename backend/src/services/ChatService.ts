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
    // Em chat privado, ambos são membros comuns
    await this.repo.addParticipant(chat.id, userA, "MEMBER");
    await this.repo.addParticipant(chat.id, userB, "MEMBER");

    return chat;
  }

  // 👥 Criar grupo (Criador vira ADMIN automaticamente)
  async createGroup(name: string, creatorId: string, userIds: string[]) {
    if (!name?.trim()) throw new Error("Nome do grupo é obrigatório");
    
    // Filtra o criador da lista de convidados para não duplicar
    const guestIds = userIds.filter(id => id !== creatorId);

    const chat = await this.repo.createChat(true, name);

    // 👑 Adiciona o criador como ADMIN
    await this.repo.addParticipant(chat.id, creatorId, "ADMIN");

    // Adiciona os demais como MEMBER
    await Promise.all(
      guestIds.map((userId) =>
        this.repo.addParticipant(chat.id, userId, "MEMBER")
      )
    );

    // 🚀 Avisar todos os participantes
    [creatorId, ...guestIds].forEach((userId) => {
      io.to(userId).emit("group:created", chat);
    });

    return chat;
  }

  async removeMember(chatId: string, adminId: string, memberIdToRemove: string) {
  // 1. Verificar se quem está removendo é ADMIN
  const isAdmin = await this.repo.checkIfIsAdmin(chatId, adminId);
  if (!isAdmin) {
    throw new Error("Apenas administradores podem remover membros.");
  }

  // 2. Impedir que o admin remova a si mesmo por esta rota (ele deve usar 'leave')
  if (adminId === memberIdToRemove) {
    throw new Error("Para sair do grupo, use a opção 'Sair'.");
  }

  // 3. Remover o membro
  await this.repo.removeParticipant(chatId, memberIdToRemove);

  // 4. Notificar via Socket
  io.to(chatId).emit("group:member_removed", { chatId, memberIdToRemove });
  
  return { success: true };
}
  // ➕ Adicionar novo membro (Apenas ADMIN pode)
  async addMember(chatId: string, adminId: string, newMemberId: string) {
    const isAdmin = await this.repo.checkIfIsAdmin(chatId, adminId);
    if (!isAdmin) {
      throw new Error("Apenas administradores podem adicionar membros ao grupo");
    }

    const participant = await this.repo.addParticipant(chatId, newMemberId, "MEMBER");
    
    // Notifica o grupo sobre a chegada do novo membro
    io.to(chatId).emit("group:member_added", { chatId, newMemberId });

    return participant;
  }

  // 🚪 Sair do grupo
  async leaveGroup(chatId: string, userId: string) {
    const chat = await this.repo.findById(chatId);
    if (!chat || !chat.isGroup) {
      throw new Error("Ação permitida apenas para grupos");
    }

    await this.repo.removeParticipant(chatId, userId);

    // Notifica os outros membros que o usuário saiu
    io.to(chatId).emit("group:member_left", { chatId, userId });

    return { message: "Você saiu do grupo com sucesso" };
  }

  // 📩 ENVIAR MENSAGEM
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

    io.to(message.chatId).emit("chat:delete_message", messageId);

    return { message: "Mensagem apagada" };
  }

  // 📊 Info do chat
  async getchatInfo(chatId: string) {
    const chat = await this.repo.chatInfo(chatId);

    if (!chat) {
      throw new Error("Ops! Esse grupo não foi encontrado.");
    }

    return chat;
  }
}