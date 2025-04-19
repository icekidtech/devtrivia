import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(data: { text: string; quizId: string }) {
    // Check if the quiz exists
    const quizExists = await this.prisma.quiz.findUnique({
      where: { id: data.quizId },
    });

    if (!quizExists) {
      throw new Error('Quiz does not exist');
    }

    // Check if the question already exists for the same quiz
    const existingQuestion = await this.prisma.question.findFirst({
      where: {
        text: data.text,
        quizId: data.quizId,
      },
    });

    if (existingQuestion) {
      // Return the existing question if it already exists
      return existingQuestion;
    }

    // Create a new question if it doesn't exist
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

  async getAllQuestions() {
    return this.prisma.question.findMany({ include: { answers: true } });
  }

  async getQuestionsByQuiz(quizId: string) {
    return this.prisma.question.findMany({
      where: { quizId },
      include: { answers: true },
    });
  }
}