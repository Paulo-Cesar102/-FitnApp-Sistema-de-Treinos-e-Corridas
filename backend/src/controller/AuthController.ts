import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // O 'result' agora contém { token, user }
      const result = await this.authService.login(email, password);

      return res.json(result);
    } catch (error) {
      return res.status(401).json({
        message: (error as Error).message,
      });
    }
  }
}