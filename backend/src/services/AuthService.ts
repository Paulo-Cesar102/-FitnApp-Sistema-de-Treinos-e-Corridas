import { UserRepository } from "../repository/UserRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {

  private userRepository = new UserRepository();

  async login(email: string, password: string) {

    const user = await this.userRepository.findByEmail(email);

    if (!user)
      throw new Error("Invalid credentials");

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch)
      throw new Error("Invalid credentials");

    // 🔐 Gerar token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      "segredo-super-secreto",
      { expiresIn: "7d" }
    );

    return { token };
  }
}
