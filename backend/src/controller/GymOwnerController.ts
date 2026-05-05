import { Request, Response } from "express";
import { GymOwnerService } from "../services/GymOwnerService";

/**
 * Controller para operações do proprietário de academia
 * Requer autenticação e verificação de permissão (GYM_OWNER)
 */
export class GymOwnerController {
  private gymOwnerService: GymOwnerService;

  constructor() {
    this.gymOwnerService = new GymOwnerService();
  }

  /**
   * Verifica se um email já está cadastrado
   * GET /owner/check-email/:email
   */
  async checkEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }

      const user = await this.gymOwnerService.checkEmail(email);

      return res.json({
        exists: !!user,
        user: user ? {
          name: user.name,
          role: user.role
        } : null
      });
    } catch (error: any) {
      console.error("Erro no checkEmail:", error);
      return res.status(400).json({
        error: error.message || "Erro ao verificar email",
      });
    }
  }

  /**
   * Cadastra um novo personal na academia
   * POST /owner/personals
   * Body: { name, email, password, specialization, bio, certifications }
   */
  async createPersonal(req: Request, res: Response) {
    try {
      // O middleware auth deve adicionar o userId e role ao req
      const userId = (req as any).userId;
      const role = (req as any).role;

      if (role !== "GYM_OWNER") {
        return res.status(403).json({
          error: "Apenas proprietários de academia podem cadastrar personals",
        });
      }

      const { name, email, password, specialization, bio, certifications } =
        req.body;
      const { gymId } = req.params as { gymId: string };

      if (!name || !email || !password || !specialization) {
        return res.status(400).json({
          error:
            "Nome, email, senha e especialização são obrigatórios",
        });
      }

      const personal = await this.gymOwnerService.createPersonal({
        name,
        email,
        password,
        specialization,
        bio,
        certifications,
        gymId,
        createdByOwnerId: userId,
      });

      return res.status(201).json({
        message: "Personal cadastrado com sucesso!",
        personal,
      });
    } catch (error: any) {
      console.error("Erro no createPersonal:", error);
      return res.status(400).json({
        error: error.message || "Erro ao cadastrar personal",
      });
    }
  }

  /**
   * Lista todos os personals da academia
   * GET /owner/:gymId/personals
   */
  async listPersonals(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { gymId } = req.params as { gymId: string };

      const personals = await this.gymOwnerService.listGymPersonals(
        gymId,
        userId
      );

      return res.json({
        total: personals.length,
        personals,
      });
    } catch (error: any) {
      console.error("Erro no listPersonals:", error);
      return res.status(400).json({
        error: error.message || "Erro ao listar personals",
      });
    }
  }

  /**
   * Lista todos os membros (alunos) da academia
   * GET /owner/:gymId/members
   */
  async listMembers(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { gymId } = req.params as { gymId: string };
      const { search } = req.query;

      const members = await this.gymOwnerService.listGymMembers(
        gymId,
        userId,
        search as string
      );

      return res.json({
        total: members.length,
        members,
      });
    } catch (error: any) {
      console.error("Erro no listMembers:", error);
      return res.status(400).json({
        error: error.message || "Erro ao listar membros",
      });
    }
  }

  /**
   * Deleta um personal
   * DELETE /owner/:gymId/personals/:personalId
   */
  async deletePersonal(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { gymId, personalId } = req.params as {
        gymId: string;
        personalId: string;
      };

      const result = await this.gymOwnerService.deletePersonal(
        personalId,
        gymId,
        userId
      );

      return res.json(result);
    } catch (error: any) {
      console.error("Erro no deletePersonal:", error);
      return res.status(400).json({
        error: error.message || "Erro ao deletar personal",
      });
    }
  }

  /**
   * Obtém estatísticas da academia
   * GET /owner/:gymId/stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { gymId } = req.params as { gymId: string };

      const stats = await this.gymOwnerService.getGymStats(gymId, userId);

      return res.json(stats);
    } catch (error: any) {
      console.error("Erro no getStats:", error);
      return res.status(400).json({
        error: error.message || "Erro ao obter estatísticas",
      });
    }
  }
}
