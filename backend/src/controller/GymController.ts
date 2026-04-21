import { Request, Response } from "express";
import GymService from "../services/GymService";

export default class GymController {

    async join(req: Request, res: Response) {

        const { identifier } = req.body;
        const userId = req.user?.id;

        try{
            if(!identifier){
                return res.status(400).json({message:"Identificador de academia é Obrigatorio!"})
            }if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        // Agora o TS sabe que userId é 100% string
        const result = await GymService.linkStudent(userId, identifier);
        
        return res.status(200).json(result);
        
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
}

async create (req: Request, res: Response){
    try {
        const gym = GymService.registerGym(req.body);
        return res.status(201).json(gym)
    }catch(error: any){
        return res.status(400).json({
            message: error.message
        });
    }
}
}
