import { FriendRequestRepository } from "../repository/FriendRequestRepository";
import { prisma } from "../database/prisma";
import { io } from "../../server";

export class FriendRequestService {
  private repo = new FriendRequestRepository();

  // 📩 ENVIAR SOLICITAÇÃO
  async sendRequest(senderId: string, receiverId: string) {
    const existing = await this.repo.findExisting(senderId, receiverId);

    if (existing) {
      if (existing.status === "ACCEPTED") throw new Error("Vocês já são amigos!");
      if (existing.status === "PENDING") throw new Error("Solicitação ainda pendente.");
      
      // Se houver uma recusada, deleta para criar uma nova
      await prisma.friendRequest.delete({ where: { id: existing.id } });
    }

    const request = await this.repo.create(senderId, receiverId);

    // 🔥 O SEGREDO: Busca o remetente para o Socket enviar o NOME e LEVEL
    const fullRequest = await prisma.friendRequest.findUnique({
      where: { id: request.id },
      include: {
        sender: {
          select: { id: true, name: true, level: true }
        }
      }
    });

    if (fullRequest) {
      console.log(`📡 Notificando usuário ${receiverId} sobre novo pedido de ${fullRequest.sender.name}`);
      io.to(receiverId).emit("friend:new_request", fullRequest);
    }

    return fullRequest;
  }

  // ✅ ACEITAR SOLICITAÇÃO
  async acceptRequest(requestId: string, userId: string) {
    const request = await this.repo.findById(requestId);

    if (!request || request.receiverId !== userId) {
      throw new Error("Solicitação inválida ou você não tem permissão.");
    }

    // 1. Atualiza status no banco
    await this.repo.updateStatus(requestId, "ACCEPTED");

    // 2. Verifica/Cria Chat Privado
    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        participants: { some: { userId: request.senderId } },
        AND: { participants: { some: { userId: request.receiverId } } },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: request.senderId },
              { userId: request.receiverId },
            ],
          },
        },
      });
    }

    // 3. 🚀 Socket: Avisa quem enviou o convite que agora são amigos
    const receiverInfo = await prisma.user.findUnique({
      where: { id: request.receiverId },
      select: { id: true, name: true, level: true }
    });

    io.to(request.senderId).emit("friend:accepted", {
      requestId,
      friend: receiverInfo,
      chat
    });

    return { message: "Amizade aceita com sucesso", chat };
  }

  // ❌ RECUSAR SOLICITAÇÃO
  async rejectRequest(requestId: string, userId: string) {
    const request = await this.repo.findById(requestId);

    if (!request || request.receiverId !== userId) {
      throw new Error("Você não pode recusar essa solicitação");
    }

    const result = await this.repo.updateStatus(requestId, "REJECTED");

    // Avisa o remetente que foi recusado (opcional)
    io.to(request.senderId).emit("friend:rejected", { requestId });

    return result;
  }

  // 👥 LISTAR AMIGOS
  async getFriends(userId: string) {
    const friends = await this.repo.findFriends(userId);
    // Retorna apenas os dados do "Amigo", ignorando o ID do usuário atual
    return friends.map((f) =>
      f.senderId === userId ? f.receiver : f.sender
    );
  }

  // ⏳ LISTAR SOLICITAÇÕES PENDENTES
  async getPending(userId: string) {
    return this.repo.findPending(userId);
  }

  // ❌ REMOVER AMIZADE
  async removeFriend(userId: string, friendId: string) {
    const result = await this.repo.deleteFriendship(userId, friendId);

    if (result.count === 0) {
      throw new Error("Amizade não encontrada ou já removida.");
    }

    return result;
  }

  // 🔍 BUSCAR USUÁRIOS
  async search(query: string) {
    if (!query) return [];
    return await this.repo.searchUsers(query);
  }
}