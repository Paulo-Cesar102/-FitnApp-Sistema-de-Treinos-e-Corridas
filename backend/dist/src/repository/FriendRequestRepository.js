"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestRepository = void 0;
const prisma_1 = require("../database/prisma");
class FriendRequestRepository {
    async create(senderId, receiverId) {
        return prisma_1.prisma.friendRequest.create({
            data: {
                senderId,
                receiverId,
            },
        });
    }
    async findExisting(senderId, receiverId) {
        return prisma_1.prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });
    }
    async findById(id) {
        return prisma_1.prisma.friendRequest.findUnique({
            where: { id }
        });
    }
    async updateStatus(id, status) {
        return prisma_1.prisma.friendRequest.update({
            where: { id },
            data: { status }
        });
    }
    async findFriends(userId) {
        return prisma_1.prisma.friendRequest.findMany({
            where: {
                status: "ACCEPTED",
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ]
            },
            include: {
                sender: true,
                receiver: true
            }
        });
    }
    async findPending(userId) {
        return prisma_1.prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: "PENDING"
            },
            include: {
                sender: true
            }
        });
    }
    async deleteFriendship(userId, friendId) {
        return prisma_1.prisma.friendRequest.deleteMany({
            where: {
                status: "ACCEPTED",
                OR: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId }
                ]
            }
        });
    }
    async searchUsers(query) {
        const cleanQuery = query.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery);
        return prisma_1.prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: cleanQuery, mode: 'insensitive' } },
                    isUuid ? { id: cleanQuery } : {}
                ]
            },
            select: { id: true, name: true, email: true, level: true }
        });
    }
}
exports.FriendRequestRepository = FriendRequestRepository;
