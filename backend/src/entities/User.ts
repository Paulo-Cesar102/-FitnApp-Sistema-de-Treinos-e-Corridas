import { Role } from '@prisma/client';
import { CompletedWorkout } from './CompletedWorkout.js';
import type { UserBadge } from './UserBadge.js'; 
import { Feedback } from './Feedback.js';

export interface IUser {
  
  id?: string; 
  name: string;
  email: string;
  password: string;
  level?: number; 
  xp?: number;    
  role?: Role;    
  createdAt?: Date;

  
  completedWorkouts?: CompletedWorkout[];
  badges?: UserBadge[];
  feedbacks?: Feedback[];
}