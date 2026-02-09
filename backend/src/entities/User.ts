import { Role } from '@prisma/client';
import { CompletedWorkout } from './CompletedWorkout.js';
import type { UserBadge } from './UserBadge.js'; 
import { Feedback } from './Feedback.js';

export interface IUser {
  id?: string; // opcional ao criar, pq o banco gera uuid
  name: string;
  email: string;
  password: string;
  level?: number; // opcional, default 1
  xp?: number;    // opcional, default 0cd
  role?: Role;    // opcional, default USER
  createdAt?: Date;

  // Relacionamentos
  completedWorkouts?: CompletedWorkout[];
  badges?: UserBadge[];
  feedbacks?: Feedback[];
}