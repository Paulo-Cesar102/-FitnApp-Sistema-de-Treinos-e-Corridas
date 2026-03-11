import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token not provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
  const decoded = jwt.verify(
    token,
    "segredo-super-secreto"
  ) as { id: string }; // Aqui você força o TS a entender o que tem dentro do token

  req.user = decoded; // Agora o TS para de chorar

  return next();
} catch {
  return res.status(401).json({ message: "Invalid token" });
}
}