import { prisma } from "../database/prisma";

export class ChatRepository {

  // 🔥 Criar chat (privado ou grupo)
  async createChat(isGroup: boolean, name?: string) {
    return prisma.chat.create({
      data: {
        isGroup,
        name
      }
    });
  }

  // 🔥 Adicionar participante ao chat
  async addParticipant(chatId: string, userId: string) {
    return prisma.chatParticipant.create({
      data: {
        chatId,
        userId
      }
    });
  }

  // 🔥 Buscar chat por ID (com participantes e mensagens)
  async findById(chatId: string) {
    return prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        messages: {
          include: {
            sender: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
  }

  // 🔥 Buscar chats do usuário
  async findUserChats(userId: string) {
    return prisma.chatParticipant.findMany({
      where: {
        userId
      },
      include: {
        chat: {
          include: {
            participants: {
              include: { user: true }
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1 // 🔥 última mensagem (preview tipo WhatsApp)
            }
          }
        }
      }
    });
  }

  // 🔥 Criar mensagem
  async createMessage(chatId: string, senderId: string, content: string) {
    return prisma.message.create({
      data: {
        chatId,
        senderId,
        content
      }
    });
  }

  // 🔥 Buscar mensagens de um chat
 async getMessages(chatId: string) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // 🔥 NORMALIZAÇÃO (isso resolve teu front quebrando)
  return messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    read: m.read,

    senderId: m.senderId, // 🔥 ESSENCIAL

    sender: {
      id: m.sender?.id,
      name: m.sender?.name,
    },
  }));
}

  // 🔥 Verificar se já existe chat privado entre 2 usuários
  async findPrivateChat(userA: string, userB: string) {
    const chats = await prisma.chat.findMany({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: {
              in: [userA, userB]
            }
          }
        }
      },
      include: {
        participants: true
      }
    });

    return chats.find(chat => chat.participants.length === 2);
  }

  // 🔥 MARCAR COMO LIDA (O que faltava para parar o erro 500)
  async updateMessagesToRead(chatId: string, userId: string) {
    return await prisma.message.updateMany({
      where: {
        chatId: chatId,
        senderId: { not: userId }, // Atualiza apenas as que VOCÊ recebeu
        read: false,
      },
      data: {
        read: true,
      },
    });
  }
}