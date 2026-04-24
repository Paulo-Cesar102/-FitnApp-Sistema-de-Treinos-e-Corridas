import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


interface JwtPayload {
  id: string;
  role: string;
  gymId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userId?: string; // Mantendo para retrocompatibilidade se necessário
      role?: string;
      gymId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;


  if (!authHeader) {
    return res.status(401).json({
      message: "Token não fornecido"
    });
  }

 
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({
      message: "Token mal formatado"
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      message: "Formato inválido"
    });
  }

  try {
   
    const secret = process.env.JWT_SECRET || "segredo-super-secreto";
    const decoded = jwt.verify(
      token,
      secret
    ) as JwtPayload;

    // 🔥 salva no request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      gymId: decoded.gymId
    };
    
    // Para compatibilidade com controllers que usam req.userId ou req.role diretamente
    (req as any).userId = decoded.id;
    (req as any).role = decoded.role;
    (req as any).gymId = decoded.gymId;

    console.log("Usuário autenticado:", req.user);

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Token inválido"
    });
  }
}