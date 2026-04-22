import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Usamos 'any' aqui para o TS parar de chorar pelo nome do tipo
export const validate = (schema: any) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: e.issues.map((issue) => ({
            field: issue.path[issue.path.length - 1], 
            message: issue.message
          })),
        });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  };