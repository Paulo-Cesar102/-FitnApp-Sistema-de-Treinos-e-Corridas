import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {

  private userService = new UserService();

  // ==============================
  // Criar usuário
  // ==============================
  async create(req: Request, res: Response): Promise<Response> {
    try {

      // 🔹 Desestruturação do body
      const { name, email, password } = req.body;

      const user = await this.userService.create({
        name,
        email,
        password
      });

      return res.status(201).json(user);

    } catch (error) {

      // 🔹 Padronização de erro
      return res.status(400).json({
        error: (error as Error).message
      });

    }
  }

  // ==============================
  // Buscar todos
  // ==============================
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

  // ==============================
  // Buscar por ID
  // ==============================
  async findById(
    req: Request<{ id: string }>,   // ⭐ MELHORIA PRINCIPAL
    res: Response
  ): Promise<Response> {

    try {

      const { id } = req.params;   // agora id é STRING garantido

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

  // ==============================
  // Deletar usuário
  // ==============================
  async delete(
    req: Request<{ id: string }>,   // ⭐ MESMA MELHORIA
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