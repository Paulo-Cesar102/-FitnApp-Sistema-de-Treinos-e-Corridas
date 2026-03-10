import { Role, Sex  } from "@prisma/client";

export interface ICreateUserDTO {
  id: string;
  name: string;
  email: string;
  password: string;
  sex: Sex;
  level: number;
  xp: number;
  role: Role;
  createdAt: Date;
}