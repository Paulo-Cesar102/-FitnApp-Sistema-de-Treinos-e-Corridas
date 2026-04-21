
import GymRepository from "../repository/GymRepository";

class GymService{

    async linkStudent (userId:string, identifier:string){

        const gym = await GymRepository.findByIdOrCode(identifier);
        if(!gym) {
            throw new Error ("Academia Não encontrada")
        }

        const updateUser = await GymRepository.updateMember(userId, gym.id);

        return {
            message: `Seja Bem vindo a ${gym.name}!`,
            gymName: gym.name,
            user: updateUser
        }

    }

    async registerGym (data:any){

        const inviteCode = data.inviteCode ||  Math.random().toString(36).substring(2, 8).toUpperCase();
        return await GymRepository.create({
            ...data,
            inviteCode

        });

    }

}

export default new GymService();