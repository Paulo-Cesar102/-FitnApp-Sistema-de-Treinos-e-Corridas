"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const prisma_1 = require("../database/prisma");
class ChatRepository {
    async createChat(data) {
        const chat = await prisma_1.prisma.chat.create({
            data: {
                isGroup: data.isGroup,
                name: data.name
            }
        });
        if (data.participantIds && data.participantIds.length > 0) {
            await Promise.all(data.participantIds.map(userId => this.addParticipant(chat.id, userId, data.isGroup ? "MEMBER" : "MEMBER")));
        }
        return chat;
    }
    async addParticipant(chatId, userId, role = "MEMBER") {
        return await prisma_1.prisma.chatParticipant.create({
            data: { chatId, userId, role }
        });
    }
    async findById(chatId) {
        return prisma_1.prisma.chat.findUnique({
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
    async findUserChats(userId) {
        return prisma_1.prisma.chatParticipant.findMany({
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
    async createMessage(chatId, senderId, content, workoutId) {
        return prisma_1.prisma.message.create({
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
    async getMessages(chatId) {
        const messages = await prisma_1.prisma.message.findMany({
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
    async findPrivateChat(userA, userB) {
        const chats = await prisma_1.prisma.chat.findMany({
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
    async updateMessagesToRead(chatId, userId) {
        return await prisma_1.prisma.message.updateMany({
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
    async deleteChatMessages(chatId) {
        return await prisma_1.prisma.message.deleteMany({
            where: {
                chatId: chatId
            }
        });
    }
    async deleteSingleMessage(messageId) {
        return await prisma_1.prisma.message.delete({
            where: {
                id: messageId
            }
        });
    }
    async chatInfo(chatId) {
        const chat = await prisma_1.prisma.chat.findUnique({
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
    async checkIfIsAdmin(chatId, userId) {
        const participant = await prisma_1.prisma.chatParticipant.findFirst({
            where: { chatId, userId, role: "ADMIN" }
        });
        return !!participant;
    }
    // Remover participante (Sair do grupo)
    async removeParticipant(chatId, userId) {
        return await prisma_1.prisma.chatParticipant.deleteMany({
            where: { chatId, userId }
        });
    }
}
exports.ChatRepository = ChatRepository;
