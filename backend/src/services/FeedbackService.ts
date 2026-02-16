import { ICreateFeedbackDTO } from "../dtos/ICreateFeedbackDTO";
import { Feedback } from "../entities/Feedback";
import { FeedbackRepository } from "../repository/FeedbackRepository";

export class FeedbackService {

  private feedbackRepository = new FeedbackRepository();

  async create(data: ICreateFeedbackDTO): Promise<Feedback> {

    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating deve ser entre 1 e 5");
    }

    const feedback = await this.feedbackRepository.create(data);

    return feedback;
  }

  async delete(id: string): Promise<void> {

    // Se quiser, dá pra validar se existe antes
    await this.feedbackRepository.delete(id);
  }
}