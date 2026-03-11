import { Role, Sex  } from "@prisma/client";

export interface ICreateUserDTO {
   name: string;
  email: string;
  password: string;
  sex: Sex;
  role?: Role;
}