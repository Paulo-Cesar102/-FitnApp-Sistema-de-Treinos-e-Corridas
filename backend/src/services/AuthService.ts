import { UserRepository } from "../repository/UserRepository";
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
    return { 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
        // Não envie a senha (password) aqui por segurança!
      }
    };
  }
}