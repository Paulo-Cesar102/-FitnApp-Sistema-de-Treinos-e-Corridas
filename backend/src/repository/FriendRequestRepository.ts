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
                senderId,
                 receiverId
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
}



