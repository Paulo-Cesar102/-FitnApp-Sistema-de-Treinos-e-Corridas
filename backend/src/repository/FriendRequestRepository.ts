import { prisma } from "../database/prisma"

export class FriendRequestRepository {

    async create(senderId: string, receiverId: string) {
        return prisma.friendRequest.create({
            data: {
                senderId,
                receiverId,
            },
            
        });

    }

   async findExisting(senderId: string, receiverId: string) {
    return prisma.friendRequest.findFirst({
        where: {
            OR: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }
    });
}
    async findById(id:string){
        return prisma.friendRequest.findUnique({
            where:{id}
        });
    }

    async updateStatus(id:string, status:"ACCEPTED"|"REJECTED"){
        return prisma.friendRequest.update({
            where:{id},
            data:{status}

        });
    }

    async accept(requestId: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Atualiza o status da solicitação
            const request = await tx.friendRequest.update({
                where: { id: requestId },
                data: { status: "ACCEPTED" }
            });

            // 2. Verifica se já existe um chat privado entre eles
            const existingChat = await tx.chat.findFirst({
                where: {
                    isGroup: false,
                    participants: {
                        every: {
                            userId: { in: [request.senderId, request.receiverId] }
                        }
                    }
                }
            });

            if (existingChat) return existingChat;

            // 3. Cria o chat privado
            const chat = await tx.chat.create({
                data: {
                    isGroup: false
                }
            });

            // 4. Adiciona os participantes
            await tx.chatParticipant.createMany({
                data: [
                    { chatId: chat.id, userId: request.senderId, role: "MEMBER" },
                    { chatId: chat.id, userId: request.receiverId, role: "MEMBER" }
                ]
            });

            return chat;
        });
    }

    async findFriends(userId:string){
        return prisma.friendRequest.findMany({
            where:{
                status:"ACCEPTED",
                OR:[
                    {senderId:userId},
                    {receiverId:userId},
                ]
            },
            include:{
              sender:true,
              receiver:true      
            }
        });
    }

    async findPending(userId:string){
        return prisma.friendRequest.findMany({
            where:{
                receiverId:userId,
                status:"PENDING"
            },
            include:{
                sender:true
            }
        });
    }

    async deleteFriendship(userId: string, friendId: string) {
    return prisma.friendRequest.deleteMany({
        where: {
            status: "ACCEPTED",
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        }
    });
}

   async searchUsers(query: string) {
    const cleanQuery = query.trim(); 
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery);

    return prisma.user.findMany({
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



