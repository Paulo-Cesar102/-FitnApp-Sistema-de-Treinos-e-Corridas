import { IWorkout } from "../entities/Workout";
import { ICreateWorkoutDTO } from "../dtos/ICreateWorkoutDTO";
import { WorkoutRepository } from "../repository/WorkoutRepository";

export class WorkoutService {

  private workoutRepository = new WorkoutRepository();

  async create(data: ICreateWorkoutDTO): Promise<IWorkout> {
    if (!data.name) {
      throw new Error("Nome do treino é obrigatório");
    }

    return this.workoutRepository.create(data);
  }

  async findAll(): Promise<IWorkout[]> {
    return this.workoutRepository.findAll();
  }

  async delete(id: string): Promise<void> {

    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new Error("Treino não encontrado");
    }

    await this.workoutRepository.delete(id);
  }

}