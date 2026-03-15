import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";

export interface IWorkoutRepository {
  create(data: ICreateWorkoutDTO): Promise<IWorkout>;
  findAll(userId: string): Promise<IWorkout[]>;
  findById(id: string): Promise<IWorkout | null>;
  delete(id: string): Promise<void>;
}