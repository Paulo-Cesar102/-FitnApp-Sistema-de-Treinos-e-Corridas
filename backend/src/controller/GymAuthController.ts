import { Request, Response } from "express";
import { GymAuthService } from "../services/GymAuthService";

export class GymAuthController {
  private gymAuthService: GymAuthService;

  constructor() {
    this.gymAuthService = new GymAuthService();
  }

  /**
   * Registra um novo usuário em uma academia existente
   * POST /auth/register/user
   * Body: { name, email, password, gymId }
   */
  async registerUserInGym(req: Request, res: Response) {
    try {
      const { name, email, password, gymId } = req.body;

      if (!name || !email || !password || !gymId) {
        return res.status(400).json({
          error: "Nome, email, senha e ID da academia são obrigatórios",
        });
      }

      const user = await this.gymAuthService.registerUserInGym({
        name,
        email,
        password,
        gymId,
      });

      return res.status(201).json({
        message: "Usuário cadastrado com sucesso na academia!",
        user,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Erro ao cadastrar usuário",
      });
    }
  }

  /**
   * Registra um novo proprietário de academia
   * POST /auth/register/gym-owner
   * Body: { name, email, password, gymName, gymDescription, gymAddress, pixKey, pixType }
   */
  async registerGymOwner(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        password,
        gymName,
        gymDescription,
        gymAddress,
        pixKey,
        pixType,
      } = req.body;

      if (!name || !email || !password || !gymName || !pixKey || !pixType) {
        return res.status(400).json({
          error:
            "Nome, email, senha, nome da academia, chave Pix e tipo de Pix são obrigatórios",
        });
      }

      const owner = await this.gymAuthService.registerGymOwner({
        name,
        email,
        password,
        gymName,
        gymDescription,
        gymAddress,
        pixKey,
        pixType,
      });

      return res.status(201).json({
        message: "Academia criada com sucesso!",
        owner,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Erro ao criar academia",
      });
    }
  }

  /**
   * Login com email e senha
   * POST /auth/login
   * Body: { email, password }
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email e senha são obrigatórios",
        });
      }

      const result = await this.gymAuthService.login({
        email,
        password,
      });

      return res.json({
        message: "Login realizado com sucesso!",
        ...result,
      });
    } catch (error: any) {
      return res.status(401).json({
        error: error.message || "Erro ao fazer login",
      });
    }
  }

  /**
   * Valida se uma academia existe
   * GET /auth/gym/:gymId
   */
  async validateGym(req: Request, res: Response) {
    try {
      const { gymId } = req.params as { gymId: string };

      const gym = await this.gymAuthService.validateGym(gymId);

      if (!gym) {
        return res.status(404).json({
          error: "Academia não encontrada",
        });
      }

      return res.json({
        success: true,
        gym,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Erro ao validar academia",
      });
    }
  }
}
