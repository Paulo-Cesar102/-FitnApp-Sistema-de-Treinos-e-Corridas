import { IUser } from './User.js';
import { IWorkout } from './Workout.js';

export interface CompletedWorkout {
  id?: string;
  userId: string;
  workoutId: string;
  xpEarned: number;
  doneAt?: Date;

  user?: IUser;
  workout?: IWorkout;
}