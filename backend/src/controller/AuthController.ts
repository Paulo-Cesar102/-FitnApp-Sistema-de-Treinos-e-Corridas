import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService";



export class AuthController {
  findAll(arg0: string, authMiddleware: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>, findAll: any) {
      throw new Error("Method not implemented.");
  }

  private authService = new AuthService();

  async login(req: Request, res: Response): Promise<Response> {

    try {

      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      return res.json(result);

    } catch (error) {

      return res.status(401).json({
        message: (error as Error).message
      });

    }
  }
}