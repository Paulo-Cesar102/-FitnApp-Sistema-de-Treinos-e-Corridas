import { prisma } from "../database/prisma";

export class ChatRepository {
  async createChat(isGroup: boolean, name?: string) {
    return prisma.chat.create({
      data: {
        isGroup,
        name
      }
    });
  }

  async addParticipant(chatId: string, userId: string) {
    return prisma.chatParticipant.create({
      data: {
        chatId,
        userId
      }
    });
  }

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
            sender: true,
            // 🔥 Traz os dados do treino se houver
            sharedWorkout: {
              include: {
                exercises: {
                  include: { exercise: true }
                }
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
  }

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
              take: 1
            }
          }
        }
      }
    });
  }

  // 🔥 ATUALIZADO: Suporte para sharedWorkoutId
  async createMessage(chatId: string, senderId: string, content: string, workoutId?: string) {
    return prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        sharedWorkoutId: workoutId // Se vier vazio, o Prisma ignora por ser opcional (?)
      },
      include: {
        sharedWorkout: true // Retorna o treino logo após criar a mensagem
      }
    });
  }

  // 🔥 ATUALIZADO: Agora inclui os dados do treino na listagem
  async getMessages(chatId: string) {
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: true,
        sharedWorkout: {
          include: {
            exercises: {
              include: { exercise: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      read: m.read,
      senderId: m.senderId,
      sharedWorkout: m.sharedWorkout, // Retorna o objeto do treino completo
      sender: {
        id: m.sender?.id,
        name: m.sender?.name,
      },
    }));
  }

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

  async updateMessagesToRead(chatId: string, userId: string) {
    return await prisma.message.updateMany({
      where: {
        chatId: chatId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
      },
    });
  }


  async deleteChatMessages(chatId: string) {
    return await prisma.message.deleteMany({
      where: {
        chatId: chatId
      }
    });
  } async deleteSingleMessage(messageId: string) {
    return await prisma.message.delete({
      where: {
        id: messageId
      }
    });
  }

  async chatInfo(chatId: string) { // Removi o UserName se ele não for usado no filtro
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
              
              }
            }
          }
        }
      }
      
    });
    return chat;
  }
}