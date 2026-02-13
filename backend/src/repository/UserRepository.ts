import { PrismaClient } from "@prisma/client";
import { IUser } from "../entities/User";
import { IUserRepository } from "./IUserRepository";
import { ICreateUserDTO } from "../dtos/ICreateUserDTO";

const prisma = new PrismaClient();

export class UserRepository implements IUserRepository {

  async create(data: ICreateUserDTO): Promise<IUser> {
    const user = await prisma.user.create({
      data
    });

    return user;
  } 

  async findById(id: string): Promise<IUser | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async findAll(): Promise<IUser[]> {
    return await prisma.user.findMany();
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }
}
