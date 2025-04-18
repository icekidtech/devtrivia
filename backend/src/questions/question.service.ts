import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(data: { text: string; quizId: string }) {
    const quizExists = await this.prisma.quiz.findUnique({
      where: { id: data.quizId },
    });

    if (!quizExists) {
      throw new Error('Quiz does not exist');
    }

    return this.prisma.question.create({
      data,
    });
  }

  async updateQuestion(id: string, data: { text?: string }) {
    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  async deleteQuestion(id: string) {
    return this.prisma.question.delete({
      where: { id },
    });
  }
}