"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestController = void 0;
const FriendRequestService_1 = require("../services/FriendRequestService");
class FriendRequestController {
    service = new FriendRequestService_1.FriendRequestService();
    // 📩 ENVIAR SOLICITAÇÃO
    async send(req, res) {
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
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao enviar solicitação"
            });
        }
    }
    // ✅ ACEITAR
    async accept(req, res) {
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
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao aceitar"
            });
        }
    }
    // ❌ RECUSAR
    async reject(req, res) {
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
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao recusar"
            });
        }
    }
    // 👥 LISTAR AMIGOS
    async friends(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }
            const result = await this.service.getFriends(userId);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar amigos"
            });
        }
    }
    // ⏳ PENDENTES
    async pending(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }
            const result = await this.service.getPending(userId);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Erro ao buscar solicitações"
            });
        }
    }
    // ❌ REMOVER AMIGO
    async delete(req, res) {
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
        }
        catch (error) {
            return res.status(400).json({
                message: error.message || "Erro ao remover amigo"
            });
        }
    }
    // 🔍 BUSCAR USUÁRIOS
    async search(req, res) {
        try {
            const { query } = req.query;
            const users = await this.service.search(String(query || ""));
            return res.json(users);
        }
        catch (error) {
            return res.status(400).json({
                message: error.message || "Erro na busca"
            });
        }
    }
}
exports.FriendRequestController = FriendRequestController;
