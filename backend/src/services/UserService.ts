import bcrypt from "bcrypt";

import { IUser } from "../entities/User";
import { ICreateUserDTO } from "../dtos/ICreateUserDTO";
import { UserRepository } from "../repository/UserRepository";

export class UserService {


  private userRepository = new UserRepository();

 
  async create(data: ICreateUserDTO): Promise<IUser> {

  
    const userExists = await this.userRepository.findByEmail(data.email);

    if (userExists) {
      throw new Error("Email já cadastrado");
    }

  
    const hashedPassword = await bcrypt.hash(data.password, 10);


    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });

    return user;
  }

  async findAll(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }


  async findById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async delete(id: string): Promise<void> {

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não existe");
    }

    await this.userRepository.delete(id);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    return this.userRepository.update(id, data);
  }
}