import { prisma } from "../database/prisma";
import { ChatRole } from "@prisma/client";

export class ChatRepository {
  async createChat(data: { isGroup: boolean; name?: string; participantIds?: string[] }) {
    const chat = await prisma.chat.create({
      data: {
        isGroup: data.isGroup,
        name: data.name
      }
    });

    if (data.participantIds && data.participantIds.length > 0) {
      await Promise.all(
        data.participantIds.map(userId =>
          this.addParticipant(chat.id, userId, data.isGroup ? "MEMBER" : "MEMBER")
        )
      );
    }

    return chat;
  }

  async addParticipant(chatId: string, userId: string, role: ChatRole = "MEMBER") {
    return await prisma.chatParticipant.create({
      data: { chatId, userId, role }
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

  // 🔥 ATUALIZADO: Suporte para sharedWorkoutId e inclusão do remetente
  async createMessage(chatId: string, senderId: string, content: string, workoutId?: string) {
    return prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        sharedWorkoutId: workoutId
      },
      include: {
        sharedWorkout: true,
        sender: {
          select: { id: true, name: true }
        }
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

  // Verificar se o usuário é admin do chat
  async checkIfIsAdmin(chatId: string, userId: string): Promise<boolean> {
    const participant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId, role: "ADMIN" }
    });
    return !!participant;
  }

  // Remover participante (Sair do grupo)
  async removeParticipant(chatId: string, userId: string) {
    return await prisma.chatParticipant.deleteMany({
      where: { chatId, userId }
    });
  }
  
  // Buscar chat por ID
 
}
