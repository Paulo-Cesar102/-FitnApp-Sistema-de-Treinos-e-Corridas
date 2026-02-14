import bcrypt from "bcrypt";

import { IUser } from "../entities/User";
import { ICreateUserDTO } from "../dtos/ICreateUserDTO";
import { UserRepository } from "../repository/UserRepository";

export class UserService {

  // Service usa repository
  private userRepository = new UserRepository();

  // Criar usuário
  async create(data: ICreateUserDTO): Promise<IUser> {

    // 🔎 1️⃣ Verificar se email já existe
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists) {
      throw new Error("Email já cadastrado");
    }

    // 🔐 2️⃣ Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 🎯 3️⃣ Enviar pro repository
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });

    return user;
  }
  // Buscar todos
  async findAll(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  // Buscar por ID
  async findById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }
  // Deletar
  async delete(id: string): Promise<void> {

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não existe");
    }

    await this.userRepository.delete(id);
  }
}