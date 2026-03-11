import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { Sex } from "@prisma/client";

export class UserController {

  private userService = new UserService();


 async create(req: Request, res: Response): Promise<Response> {
  try {

    const { name, email, password, sex } = req.body;

    const user = await this.userService.create({
      name,
      email,
      password,
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