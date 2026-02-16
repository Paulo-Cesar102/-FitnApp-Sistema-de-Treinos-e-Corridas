import { Feedback } from "../entities/Feedback";
import { ICreateFeedbackDTO } from "../dtos/ICreateFeedbackDTO";


export interface IFeedbackRepository {
  create(data: ICreateFeedbackDTO): Promise<Feedback>;
  findById(id: string): Promise<Feedback | null>;
  findAll(): Promise<Feedback[]>;
  delete(id: string): Promise<void>;
}