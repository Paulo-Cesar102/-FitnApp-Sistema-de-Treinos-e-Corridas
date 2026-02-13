import { ICreateUserDTO } from "../dtos/ICreateUserDTO";
import { IUser } from "../entities/User";

export interface IUserRepository {
  create(data: ICreateUserDTO): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  delete(id: string): Promise<void>;
}
