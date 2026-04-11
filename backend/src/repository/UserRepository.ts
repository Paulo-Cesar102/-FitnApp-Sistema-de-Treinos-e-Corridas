import { IUser } from "../entities/User";
import { IUserRepository } from "./IUserRepository";
import { ICreateUserDTO } from "../dtos/ICreateUserDTO";
import { prisma } from "../database/prisma";
import { Sex } from "@prisma/client";

export class UserRepository implements IUserRepository {

  async create(data: ICreateUserDTO): Promise<IUser> {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,  
          sex: data.sex,
          role: data.role ?? "USER"
        }
    });

    return user;
  }

  

  async findById(id: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findAll(): Promise<IUser[]> {
    return prisma.user.findMany({
    
      select: {
        id: true,
        name: true,
        email: true,
        sex: true,
        level: true,
        xp: true,
        role: true,
        createdAt: true
      }
    }) as unknown as IUser[];
  }

  async delete(id: string): Promise<void> {
    
    await prisma.user.delete({
      where: { id }
    });
  }
}

