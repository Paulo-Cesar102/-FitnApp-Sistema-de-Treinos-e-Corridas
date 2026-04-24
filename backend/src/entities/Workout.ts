import { CompletedWorkout } from './CompletedWorkout';

export interface IWorkout {
  id?: string;
  name: string;
  gymId?: string;
  exercises?: any[]; // For now using any[], but ideally it should be specific

  completedBy?: CompletedWorkout[];
}