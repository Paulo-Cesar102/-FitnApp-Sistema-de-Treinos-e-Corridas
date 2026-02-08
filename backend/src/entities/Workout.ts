import { CompletedWorkout } from './CompletedWorkout.js';

export interface IWorkout {
  id?: string;
  name: string;

  completedBy?: CompletedWorkout[];
}