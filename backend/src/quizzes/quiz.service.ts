import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: { title: string; description?: string; ownerId: string }) {
    return this.prisma.quiz.create({
      data,
    });
  }

  async getQuizzes() {
    return this.prisma.quiz.findMany({
      include: { questions: true },
    });
  }

  async getQuizById(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
  }

  async deleteQuiz(id: string) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}