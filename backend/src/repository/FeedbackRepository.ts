import { Feedback } from "../entities/Feedback";
import { ICreateFeedbackDTO } from "../dtos/ICreateFeedbackDTO";
import { IFeedbackRepository } from "./IFeedbackRepository";
import { prisma } from "../database/prisma";

export class FeedbackRepository implements IFeedbackRepository {

  async create(data: ICreateFeedbackDTO): Promise<Feedback> {
    const feedback = await prisma.feedback.create({
      data
    });

    return feedback;
  }

  async findById(id: string): Promise<Feedback | null> {
    return prisma.feedback.findUnique({
      where: { id }
    });
  }

  async findAll(): Promise<Feedback[]> {
    return prisma.feedback.findMany();
  }

  async delete(id: string): Promise<void> {
    await prisma.feedback.delete({
      where: { id }
    });
  }
}