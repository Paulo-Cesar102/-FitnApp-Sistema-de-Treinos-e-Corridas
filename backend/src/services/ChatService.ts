import { ChatRepository } from "../repository/ChatRepository";
import { prisma } from "../database/prisma";

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

    return chat;
  }

  // 📩 ENVIAR MENSAGEM (Com suporte a Treino)
  async sendMessage(chatId: string, senderId: string, content: string, workoutId?: string) {
    if (!chatId) throw new Error("chatId inválido");
    if (!senderId) throw new Error("senderId inválido");
    
    // Agora aceita conteúdo vazio SE houver um workoutId (enviando só o treino)
    if (!content?.trim() && !workoutId) {
      throw new Error("Mensagem vazia");
    }

    return this.repo.createMessage(chatId, senderId, content.trim(), workoutId);
  }

  // 📋 Listar chats do usuário formatados
  async getUserChats(userId: string) {
    if (!userId) throw new Error("userId inválido");

    const chatParticipants = await this.repo.findUserChats(userId);

    // Mapeamos para retornar o objeto do chat limpo
    return chatParticipants.map((c: any) => c.chat);
  }

  // 💬 Buscar mensagens e marcar como lidas
  async getMessages(chatId: string, userId: string) {
    if (!chatId) throw new Error("chatId inválido");

    // Marcar como lido ao abrir a conversa
    await this.repo.updateMessagesToRead(chatId, userId);

    return this.repo.getMessages(chatId);
  }

  // 🔥 Marcar como lido manualmente
  async markAsRead(chatId: string, userId: string) {
    if (!chatId || !userId) throw new Error("Parâmetros inválidos");
    return this.repo.updateMessagesToRead(chatId, userId);
  }

  // 🗑️ Limpar histórico de mensagens
  async clearChatHistory(chatId: string) {
    if (!chatId) throw new Error("chatId inválido");
    return this.repo.deleteChatMessages(chatId);
  }

  /**
   * 🏋️ CLONAR TREINO COMPARTILHADO
   * Cria uma cópia independente para o usuário que salvou.
   */
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
}