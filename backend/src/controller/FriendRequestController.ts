import { Request, Response } from "express";
import { FriendRequestService } from "../services/FriendRequestService";

export class FriendRequestController {
  private service = new FriendRequestService();

  // 📩 ENVIAR SOLICITAÇÃO
  async send(req: Request, res: Response) {
    try {
      const senderId = req.user?.id;
      const { receiverId } = req.body;

      if (!senderId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!receiverId) {
        return res.status(400).json({ message: "receiverId é obrigatório" });
      }

      if (senderId === receiverId) {
        return res.status(400).json({
          message: "Você não pode adicionar a si mesmo"
        });
      }

      const result = await this.service.sendRequest(senderId, receiverId);

      return res.status(201).json({
        message: "Solicitação enviada com sucesso",
        data: result
      });

    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao enviar solicitação"
      });
    }
  }

  // ✅ ACEITAR
  async accept(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!requestId) {
        return res.status(400).json({ message: "requestId é obrigatório" });
      }

      const result = await this.service.acceptRequest(requestId, userId);

      return res.json({
        message: "Solicitação aceita",
        data: result
      });

    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao aceitar"
      }
      
    );

      
    }
  }

  // ❌ RECUSAR
  async reject(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!requestId) {
        return res.status(400).json({ message: "requestId é obrigatório" });
      }

      const result = await this.service.rejectRequest(requestId, userId);

      return res.json({
        message: "Solicitação recusada",
        data: result
      });

    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao recusar"
      });
    }
  }

  // 👥 LISTAR AMIGOS
  async friends(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const result = await this.service.getFriends(userId);

      return res.json(result);

    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar amigos"
      });
    }
  }

  // ⏳ PENDENTES
  async pending(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const result = await this.service.getPending(userId);

      return res.json(result);

    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao buscar solicitações"
      });
    }
  }

  // ❌ REMOVER AMIGO
  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!id) {
        return res.status(400).json({ message: "ID do amigo é obrigatório" });
      }

      await this.service.removeFriend(userId, id);

      return res.status(204).send();

    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Erro ao remover amigo"
      });
    }
  }

  // 🔍 BUSCAR USUÁRIOS
  async search(req: Request, res: Response) {
    try {
      const { query } = req.query;

      const users = await this.service.search(String(query || ""));

      return res.json(users);

    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Erro na busca"
      });
    }
  }
}