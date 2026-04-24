import { UserRepository } from "../repository/UserRepository";
import { prisma } from "../database/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  private userRepository = new UserRepository();

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      "segredo-super-secreto", // Dica: use process.env.JWT_SECRET no futuro
      { expiresIn: "7d" }
    );

    // --- ALTERAÇÃO AQUI: RETORNANDO O TOKEN + DADOS DO USUÁRIO ---
    const userData = user as any;
    const gymId = userData.role === "GYM_OWNER" ? userData.ownedGym?.id : userData.gymId;
    const gymName = userData.role === "GYM_OWNER" ? userData.ownedGym?.name : userData.gym?.name;

    // Busca inscrições com personals se for aluno
    const personalSubscriptions = await prisma.gymPersonalStudent.findMany({
      where: { studentId: user.id },
      select: { personalId: true }
    });

    return { 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        gymId,
        gymName,
        personalSubscriptions: personalSubscriptions.map(s => s.personalId)
      }
    };
  }
}