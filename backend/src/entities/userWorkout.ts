export interface UserWorkout {
  id: string;
  name: string;
  createdAt: Date;

  userId: string;
  categoryId: string;
}
