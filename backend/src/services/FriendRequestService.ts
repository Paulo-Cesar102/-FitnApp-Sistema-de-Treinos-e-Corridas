import { FriendRequestRepository } from "../repository/FriendRequestRepository";
import { NotificationService } from "./NotificationService";
import { prisma } from "../database/prisma";
import { io } from "../../server";

export class FriendRequestService {
  private repo = new FriendRequestRepository();
  private notificationService = new NotificationService();

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new Error("Você não pode enviar solicitação para si mesmo.");
    }

    const existing = await this.repo.findExisting(senderId, receiverId);
    if (existing && existing.status === "PENDING") {
      throw new Error("Já existe uma solicitação pendente.");
    }

    if (existing && existing.status === "ACCEPTED") {
      throw new Error("Vocês já são amigos.");
    }

    if (existing) {
      await prisma.friendRequest.delete({ where: { id: existing.id } });
    }

    const request = await this.repo.create(senderId, receiverId);

    const fullRequest = await prisma.friendRequest.findUnique({
      where: { id: request.id },
      include: {
        sender: {
          select: { id: true, name: true, level: true }
        }
      }
    });

    if (fullRequest) {
      io.to(receiverId).emit("friend:new_request", fullRequest);

      await this.notificationService.create(
        receiverId,
        "Nova Solicitacao",
        `${fullRequest.sender.name} quer ser seu amigo!`,
        "FRIEND_REQUEST"
      );
    }

    return fullRequest;
  }

  async acceptRequest(requestId: string, userId: string) {
    const request = await this.repo.findById(requestId);

    if (!request || request.receiverId !== userId) {
      throw new Error("Solicitação inválida ou você não tem permissão.");
    }

    const chat = await this.repo.accept(requestId);

    const receiverInfo = await prisma.user.findUnique({
      where: { id: request.receiverId },
      select: { id: true, name: true, level: true }
    });

    if (receiverInfo) {
      io.to(request.senderId).emit("friend:request_accepted", {
        chat,
        friend: {
          id: receiverInfo.id,
          name: receiverInfo.name,
          level: receiverInfo.level
        }
      });

      await this.notificationService.create(
        request.senderId,
        "Solicitacao Aceita",
        `${receiverInfo.name} aceitou seu pedido de amizade!`,
        "FRIEND_ACCEPTED"
      );
    }

    return { message: "Amizade aceita com sucesso", chat };
  }

  async rejectRequest(requestId: string, userId: string) {
    const request = await this.repo.findById(requestId);

    if (!request || request.receiverId !== userId) {
      throw new Error("Você não pode recusar essa solicitação");
    }

    return this.repo.updateStatus(requestId, "REJECTED");
  }

  async getFriends(userId: string) {
    const friendships = await this.repo.findFriends(userId);
    
    // Transforma a lista de amizades em uma lista de objetos do Amigo
    return friendships.map(f => {
      const friend = f.senderId === userId ? f.receiver : f.sender;
      return {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        level: friend.level,
        xp: friend.xp
      };
    });
  }

  async getPending(userId: string) {
    return this.repo.findPending(userId);
  }

  async search(query: string) {
    return this.repo.searchUsers(query);
  }

  async removeFriend(userId: string, friendId: string) {
    const result = await this.repo.deleteFriendship(userId, friendId);

    if (result.count === 0) {
      throw new Error("Amizade não encontrada ou já removida.");
    }

    return result;
  }
}
