import { FriendRequestRepository } from "../repository/FriendRequestRepository";

export class FriendRequestService {
  private repo = new FriendRequestRepository();

  async sendRequest(senderId: string, receiverId: string) {
    if (!senderId) {
      throw new Error("Usuário não autenticado");
    }

    if (senderId === receiverId) {
      throw new Error("Você não pode adicionar a si mesmo!");
    }

    const existing = await this.repo.findExisting(senderId, receiverId);

    if (existing) {
      throw new Error("Solicitação já enviada");
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

    return this.repo.updateStatus(requestId, "ACCEPTED");
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
}