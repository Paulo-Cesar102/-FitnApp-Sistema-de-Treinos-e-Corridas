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
      const { name, email, password, sex } = req.body;

      const user = await this.userService.create({
        name,
        email,
        password, // Dica: No seu UserService.create, lembre de usar bcrypt.hash aqui!
        sex: sex.toUpperCase() as Sex,
        role: "USER"
      });

      return res.status(201).json(user);

    } catch (error) {
      return res.status(400).json({
        error: (error as Error).message
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userService.findAll();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error"
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
        error: "Internal server error"
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
        error: "Internal server error"
      });
    }
  }
}