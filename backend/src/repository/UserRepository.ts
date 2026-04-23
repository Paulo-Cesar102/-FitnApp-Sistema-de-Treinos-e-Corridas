import { IUser } from "../entities/User";
import { IUserRepository } from "./IUserRepository";
import { ICreateUserDTO } from "../dtos/ICreateUserDTO";
import { prisma } from "../database/prisma";

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

    return user as unknown as IUser;
  }

  async findById(id: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { id }
    }) as unknown as IUser | null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { email }
    }) as unknown as IUser | null;
  }

  async findAll(): Promise<IUser[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        sex: true,
        level: true,
        xp: true,
        streak: true,
        role: true,
        createdAt: true,
    
        _count: {
          select: {
            completedWorkoutExercises: true,
            completedWorkouts: true
          }
        }
      }
    });

    // Mapeamos para que o objeto fique mais limpo para o frontend (opcional)
    return users.map(user => ({
      ...user,
      totalExercisesDone: user._count.completedWorkoutExercises,
      totalWorkoutsDone: user._count.completedWorkouts,
      _count: undefined // Remove o objeto bruto do Prisma se preferir
    })) as unknown as IUser[];
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }
}