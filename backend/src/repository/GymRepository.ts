import {prisma} from "../database/prisma"

class GymRepository {

    async findByIdOrCode(identifier:string){

        return await prisma.gym.findFirst ({

            where :{
                OR:[
                    {id:identifier},
                    {inviteCode:identifier}
                ] 
            
            } 
        })


    }

    async create(data:any){
        return await prisma.gym.create({

            data
        });
        
    }
 async updateMember(userId:string , gymId:string){
 return await prisma.user.update({

    where: {id:userId},
    data: {gymId}
 });

 }
}

export default new GymRepository