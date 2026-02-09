export interface UserWorkoutExercise {
  id: string;

  userWorkoutId: string;
  exerciseId: string;

  sets: number;
  reps: number;
}
