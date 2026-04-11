import { Request, Response } from "express";
import { FriendRequestService } from "../services/FriendRequestService";

export class FriendRequestController {
  private service = new FriendRequestService();

  async send(req: Request, res: Response) {
    try {
      const senderId = (req as any).user?.id;
      const { receiverId } = req.body;

      const result = await this.service.sendRequest(senderId, receiverId);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao enviar solicitação",
      });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { requestId } = req.body;

      const result = await this.service.acceptRequest(
        requestId,
        userId
      );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao aceitar",
      });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { requestId } = req.body;

      const result = await this.service.rejectRequest(
        requestId,
        userId
      );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Erro ao recusar",
      });
    }
  }

  async friends(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const result = await this.service.getFriends(userId);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar amigos",
      });
    }
  }

  async pending(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const result = await this.service.getPending(userId);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar solicitações",
      });
    }
  }
}