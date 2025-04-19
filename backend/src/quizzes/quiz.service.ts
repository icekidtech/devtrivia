import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: { title: string; description?: string; ownerId: string }) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.ownerId },
    });

    if (!userExists) {
      throw new Error('Owner does not exist');
    }

    return this.prisma.quiz.create({ data });
  }

  async getAllQuizzes() {
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

  async updateQuiz(id: string, data: { title?: string; description?: string }) {
    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async getQuizLeaderboard(quizId: string) {
    // Example: aggregate scores for each user for this quiz
    return this.prisma.result.findMany({
      where: { quizId },
      select: {
        user: { select: { name: true } },
        score: true,
      },
      orderBy: { score: 'desc' },
      take: 10,
    }).then(results =>
      results.map(r => ({
        userName: r.user.name,
        score: r.score,
      }))
    );
  }
}