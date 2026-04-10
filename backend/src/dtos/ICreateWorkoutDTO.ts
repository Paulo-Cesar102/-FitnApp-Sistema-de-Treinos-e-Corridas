export interface ICreateWorkoutDTO {
  name: string;
  userId: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
  }[];
}