import { IUser } from './User';

export interface Feedback {
  id?: string;
  userId: string;
  message: string;
  rating: number;
  createdAt?: Date;

  user?: IUser;
}