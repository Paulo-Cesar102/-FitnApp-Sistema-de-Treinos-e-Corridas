import { Request, Response } from "express";
import { GymPersonalService } from "../services/GymPersonalService";

export class GymPersonalController {
  private gymPersonalService: GymPersonalService;

  constructor() {
    this.gymPersonalService = new GymPersonalService();
  }

  async createPersonal(req: Request, res: Response) {
    try {
      const { userId, gymId, specialization, bio, certifications } = req.body;

      if (!userId || !gymId) {
        return res
          .status(400)
          .json({ error: "userId e gymId são obrigatórios" });
      }

      const personal = await this.gymPersonalService.createPersonal({
        userId,
        gymId,
        specialization,
        bio,
        certifications,
      });

      return res.status(201).json(personal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getPersonalById(req: Request, res: Response) {
    try {
      const { personalId } = req.params as { personalId: string };

      const personal = await this.gymPersonalService.getPersonalById(
        personalId
      );

      if (!personal) {
        return res.status(404).json({ error: "Personal não encontrado" });
      }

      return res.json(personal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getPersonalByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params as { userId: string };

      const personal = await this.gymPersonalService.getPersonalByUserId(
        userId
      );

      if (!personal) {
        return res.status(404).json({ error: "Personal não encontrado" });
      }

      return res.json(personal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getGymPersonals(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const personals = await this.gymPersonalService.getGymPersonals(gymId);

      return res.json(personals);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updatePersonal(req: Request, res: Response) {
    try {
      const { personalId } = req.params as { personalId: string };
      const { specialization, bio, certifications } = req.body;

      const personal = await this.gymPersonalService.updatePersonal(
        personalId,
        {
          specialization,
          bio,
          certifications,
        }
      );

      return res.json(personal);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deletePersonal(req: Request, res: Response) {
    try {
      const { personalId } = req.params as { personalId: string };

      await this.gymPersonalService.deletePersonal(personalId);

      return res.json({ message: "Personal deletado com sucesso" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async assignStudent(req: Request, res: Response) {
    try {
      const { personalId } = req.body;
      let { studentId } = req.body;
      
      // Se studentId não for enviado, assume que o próprio usuário logado quer se inscrever
      if (!studentId) {
        studentId = (req as any).userId || req.user?.id;
      }

      if (!personalId || !studentId) {
        return res.status(400).json({
          error: "personalId e studentId são obrigatórios",
        });
      }

      const assignment = await this.gymPersonalService.assignStudent({
        personalId,
        studentId,
      });

      return res.status(201).json(assignment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async removeStudent(req: Request, res: Response) {
    try {
      const { personalId, studentId } = req.params as { personalId: string; studentId: string };

      await this.gymPersonalService.removeStudent(personalId, studentId);

      return res.json({ message: "Aluno removido com sucesso" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getStudents(req: Request, res: Response) {
    try {
      const { personalId } = req.params as { personalId: string };

      const students = await this.gymPersonalService.getStudents(personalId);

      return res.json(students);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async createSupportChat(req: Request, res: Response) {
    try {
      const { personalId, studentIds, chatName } = req.body;

      if (!personalId || !studentIds || !chatName) {
        return res.status(400).json({
          error: "personalId, studentIds e chatName são obrigatórios",
        });
      }

      const supportChat = await this.gymPersonalService.createSupportChat({
        personalId,
        studentIds,
        chatName,
      });

      return res.status(201).json(supportChat);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getSupportChats(req: Request, res: Response) {
    try {
      const { personalId } = req.params as { personalId: string };

      const chats = await this.gymPersonalService.getSupportChats(personalId);

      return res.json(chats);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
