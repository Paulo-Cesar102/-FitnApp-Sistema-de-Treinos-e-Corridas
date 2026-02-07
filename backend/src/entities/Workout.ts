import { CompletedWorkout } from './CompletedWorkout';

export interface IWorkout {
  id?: string;
  name: string;

  completedBy?: CompletedWorkout[];
}