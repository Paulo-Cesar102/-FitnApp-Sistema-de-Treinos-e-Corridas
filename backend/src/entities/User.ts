import { Role, Difficulty } from '@prisma/client';
import { CompletedWorkout } from './CompletedWorkout';
import type { UserBadge } from './UserBadge'; 
import { Feedback } from './Feedback';

export interface IUser {
  
  id?: string; 
  name: string;
  email: string;
  password: string;
  sex: string;
  level?: number; 
  xp?: number;    
  streak: number;
  maxStreak: number;
  weightGoal?: number;
  height?: number;
  goalType?: string;
  experienceLevel?: Difficulty;
  onboardingCompleted?: boolean;
  lastUnsubscribedAt?: Date;
  lastActivityDate?: Date;
  gymId?: string;
  role?: Role;    
  createdAt?: Date;

  
  completedWorkouts?: CompletedWorkout[];
  badges?: UserBadge[];
  feedbacks?: Feedback[];
}