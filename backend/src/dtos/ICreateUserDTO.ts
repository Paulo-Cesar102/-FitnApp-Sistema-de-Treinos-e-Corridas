import { Role } from "@prisma/client";

export interface ICreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: Role;
}