"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const ChatRepository_1 = require("../repository/ChatRepository");
const prisma_1 = require("../database/prisma");
const server_1 = require("../../server");
class ChatService {
    repo = new ChatRepository_1.ChatRepository();
    // 💬 Criar ou buscar chat privado
    async createPrivateChat(userA, userB) {
        if (!userA || !userB)
            throw new Error("Usuários inválidos");
        if (userA === userB)
            throw new Error("Não pode criar chat com você mesmo");
        const existing = await this.repo.findPrivateChat(userA, userB);
        if (existing)
            return existing;
        const chat = await this.repo.createChat({ isGroup: false });
        // Em chat privado, ambos são membros comuns
        await this.repo.addParticipant(chat.id, userA, "MEMBER");
        await this.repo.addParticipant(chat.id, userB, "MEMBER");
        return chat;
    }
    // 👥 Criar grupo (Criador vira ADMIN automaticamente)
    async createGroup(name, creatorId, userIds) {
        if (!name?.trim())
            throw new Error("Nome do grupo é obrigatório");
        // Filtra o criador da lista de convidados para não duplicar
        const guestIds = userIds.filter(id => id !== creatorId);
        const chat = await this.repo.createChat({ isGroup: true, name });
        // 👑 Adiciona o criador como ADMIN
        await this.repo.addParticipant(chat.id, creatorId, "ADMIN");
        // Adiciona os demais como MEMBER
        await Promise.all(guestIds.map((userId) => this.repo.addParticipant(chat.id, userId, "MEMBER")));
        // 🚀 Avisar todos os participantes
        [creatorId, ...guestIds].forEach((userId) => {
            server_1.io.to(userId).emit("group:created", chat);
        });
        return chat;
    }
    async removeMember(chatId, adminId, memberIdToRemove) {
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
        server_1.io.to(chatId).emit("group:member_removed", { chatId, memberIdToRemove });
        return { success: true };
    }
    // ➕ Adicionar novo membro (Apenas ADMIN pode)
    async addMember(chatId, adminId, newMemberId) {
        const isAdmin = await this.repo.checkIfIsAdmin(chatId, adminId);
        if (!isAdmin) {
            throw new Error("Apenas administradores podem adicionar membros ao grupo");
        }
        const participant = await this.repo.addParticipant(chatId, newMemberId, "MEMBER");
        // Notifica o grupo sobre a chegada do novo membro
        server_1.io.to(chatId).emit("group:member_added", { chatId, newMemberId });
        return participant;
    }
    // 🚪 Sair do grupo
    async leaveGroup(chatId, userId) {
        const chat = await this.repo.findById(chatId);
        if (!chat || !chat.isGroup) {
            throw new Error("Ação permitida apenas para grupos");
        }
        await this.repo.removeParticipant(chatId, userId);
        // Notifica os outros membros que o usuário saiu
        server_1.io.to(chatId).emit("group:member_left", { chatId, userId });
        return { message: "Você saiu do grupo com sucesso" };
    }
    // 📩 ENVIAR MENSAGEM
    async sendMessage(chatId, senderId, content, workoutId) {
        if (!chatId || !senderId)
            throw new Error("Parâmetros inválidos");
        if (!content?.trim() && !workoutId) {
            throw new Error("Mensagem vazia");
        }
        const message = await this.repo.createMessage(chatId, senderId, content?.trim(), workoutId);
        // 🚀🔥 EMITE PARA A SALA DO CHAT
        server_1.io.to(chatId).emit("chat:new_message", message);
        return message;
    }
    // 📋 Listar chats do usuário
    async getUserChats(userId) {
        if (!userId)
            throw new Error("userId inválido");
        const chatParticipants = await this.repo.findUserChats(userId);
        return chatParticipants.map((c) => c.chat);
    }
    // 💬 Buscar mensagens
    async getMessages(chatId, userId) {
        if (!chatId)
            throw new Error("chatId inválido");
        await this.repo.updateMessagesToRead(chatId, userId);
        return this.repo.getMessages(chatId);
    }
    // 🔥 Marcar como lido
    async markAsRead(chatId, userId) {
        if (!chatId || !userId)
            throw new Error("Parâmetros inválidos");
        const result = await this.repo.updateMessagesToRead(chatId, userId);
        server_1.io.to(chatId).emit("chat:read", {
            chatId,
            userId
        });
        return result;
    }
    // 🗑️ Limpar histórico
    async clearChatHistory(chatId) {
        if (!chatId)
            throw new Error("chatId inválido");
        const result = await this.repo.deleteChatMessages(chatId);
        server_1.io.to(chatId).emit("chat:cleared", chatId);
        return result;
    }
    // 🏋️ Salvar treino compartilhado
    async saveSharedWorkout(targetUserId, workoutData) {
        if (!workoutData || !workoutData.exercises) {
            throw new Error("Dados do treino incompletos.");
        }
        return await prisma_1.prisma.userWorkout.create({
            data: {
                name: `${workoutData.name} (Importado)`,
                userId: targetUserId,
                exercises: {
                    create: workoutData.exercises.map((ex) => ({
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
    async deleteMessageForEveryone(messageId, userId) {
        const message = await prisma_1.prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message)
            throw new Error("Mensagem não encontrada.");
        if (message.senderId !== userId) {
            throw new Error("Você não tem permissão para apagar esta mensagem.");
        }
        await this.repo.deleteSingleMessage(messageId);
        server_1.io.to(message.chatId).emit("chat:delete_message", messageId);
        return { message: "Mensagem apagada" };
    }
    // 📊 Info do chat
    async getchatInfo(chatId) {
        const chat = await this.repo.chatInfo(chatId);
        if (!chat) {
            throw new Error("Ops! Esse grupo não foi encontrado.");
        }
        return chat;
    }
}
exports.ChatService = ChatService;
