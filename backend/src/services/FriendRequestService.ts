import { FriendRequestRepository } from "../repository/FriendRequestRepository";
import { prisma } from "../database/prisma";

export class FriendRequestService {
  private repo = new FriendRequestRepository();

  async sendRequest(senderId: string, receiverId: string) {
    const existing = await this.repo.findExisting(senderId, receiverId);

    if (existing) {
      if (existing.status === "ACCEPTED") {
        throw new Error("Vocês já são amigos!");
      }

      if (existing.status === "PENDING") {
        throw new Error("Solicitação ainda pendente.");
      }

      await prisma.friendRequest.delete({
        where: { id: existing.id },
      });
    }

    return this.repo.create(senderId, receiverId);
  }

  async acceptRequest(requestId: string, userId: string) {
    const request = await this.repo.findById(requestId);

    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    if (request.receiverId !== userId) {
      throw new Error("Você não pode aceitar essa solicitação");
    }

    await this.repo.updateStatus(requestId, "ACCEPTED");

    
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        participants: {
          some: { userId: request.senderId },
        },
        AND: {
          participants: {
            some: { userId: request.receiverId },
          },
        },
      },
    });

    if (!existingChat) {
      await prisma.chat.create({
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

    return { message: "Amizade aceita e chat criado!" };
  }

  async rejectRequest(requestId: string, userId: string) {
    const request = await this.repo.findById(requestId);

    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    if (request.receiverId !== userId) {
      throw new Error("Você não pode recusar essa solicitação");
    }

    return this.repo.updateStatus(requestId, "REJECTED");
  }

  async getFriends(userId: string) {
    const friends = await this.repo.findFriends(userId);

    return friends.map((f) =>
      f.senderId === userId ? f.receiver : f.sender
    );
  }

  async getPending(userId: string) {
    return this.repo.findPending(userId);
  }

  async removeFriend(userId: string, friendId: string) {
    const result = await this.repo.deleteFriendship(userId, friendId);

    if (result.count === 0) {
      throw new Error("Amizade não encontrada ou já removida.");
    }

    return result;
  }

  async search(query: string) {
    if (!query) return [];
    return await this.repo.searchUsers(query);
  }
}