export interface ICreateWorkoutDTO {
  name: string;
  userId: string;
  gymId?: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
  }[];
}