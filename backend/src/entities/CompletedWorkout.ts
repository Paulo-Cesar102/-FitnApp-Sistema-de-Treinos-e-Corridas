import { IUser } from './User';
import { IWorkout } from './Workout';

export interface CompletedWorkout {
  id?: string;
  userId: string;
  workoutId: string;
  xpEarned: number;
  doneAt?: Date;

  user?: IUser;
  workout?: IWorkout;
}