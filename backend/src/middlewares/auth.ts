import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


interface JwtPayload {
  id: string;
}


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
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
   
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 🔥 salva no request
    req.user = {
      id: decoded.id
    };

    console.log("Usuário autenticado:", req.user);

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Token inválido"
    });
  }
}