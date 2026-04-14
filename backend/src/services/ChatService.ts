import { ChatRepository } from "../repository/ChatRepository";

export class ChatService {
  private repo = new ChatRepository();

  // 💬 Criar chat privado
  async createPrivateChat(userA: string, userB: string) {
    if (!userA || !userB) {
      throw new Error("Usuários inválidos");
    }

    if (userA === userB) {
      throw new Error("Não pode criar chat com você mesmo");
    }

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

  // 📩 ENVIAR MENSAGEM (REFORÇADO)
  async sendMessage(chatId: string, senderId: string, content: string) {
    if (!chatId) throw new Error("chatId inválido");
    if (!senderId) throw new Error("senderId inválido");
    if (!content?.trim()) throw new Error("Mensagem vazia");

    return this.repo.createMessage(chatId, senderId, content.trim());
  }

  // 📋 chats do usuário
  async getUserChats(userId: string) {
    if (!userId) throw new Error("userId inválido");

    const chats = await this.repo.findUserChats(userId);

    return chats.map((c: any) => c.chat);
  }

  // 💬 mensagens
  async getMessages(chatId: string) {
    if (!chatId) throw new Error("chatId inválido");

    return this.repo.getMessages(chatId);
  }

  // 🔥 marcar como lido
  async markAsRead(chatId: string, userId: string) {
    if (!chatId || !userId) {
      throw new Error("Parâmetros inválidos");
    }

    return this.repo.updateMessagesToRead(chatId, userId);
  }
}