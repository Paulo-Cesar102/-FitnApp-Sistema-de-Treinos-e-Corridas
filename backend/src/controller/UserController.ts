import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { AuthService } from "../services/AuthService"; // Importando o serviço de autenticação
import { Sex } from "@prisma/client";

export class UserController {
  private userService = new UserService();
  private authService = new AuthService(); // Instanciando o AuthService

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // Chama o AuthService que você mostrou. 
      // Ele já valida o e-mail, compara o Bcrypt e gera o Token.
      const result = await this.authService.login(email, password);

      // Se deu certo, retorna { token: "..." }
      return res.json(result);

    } catch (error) {
      // Se o erro for "Invalid credentials", cai aqui
      return res.status(401).json({
        error: (error as Error).message
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, sex, role, gymId } = req.body;

      const user = await this.userService.create({
        name,
        email,
        password,
        sex: sex ? (sex.toUpperCase() as Sex) : Sex.M,
        role: role || "USER",
        gymId: gymId
      });

      return res.status(201).json(user);

    } catch (error) {
      console.error("🔥 Erro ao criar usuário:", error);
      return res.status(400).json({
        message: (error as Error).message
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userService.findAll();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }

  async search(req: Request, res: Response): Promise<Response> {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const users = await this.userService.search(q as string);
      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }

  async findById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }

  async delete(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params as any;
      const data = req.body;
      const user = await this.userService.update(id, data);
      return res.json(user);
    } catch (error) {
      console.error("🔥 Erro ao atualizar usuário:", error);
      return res.status(400).json({
        message: (error as Error).message
      });
    }
  }
}