import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: { title: string; description?: string; ownerName: string }) {
    if (!data.ownerName) {
      throw new Error('ownerName is required');
    }
    
    const user = await this.prisma.user.findUnique({
      where: { name: data.ownerName },
    });

    if (!user) {
      throw new Error('User does not exist');
    }

    // Create quiz with the found user's ID
    return this.prisma.quiz.create({ 
      data: {
        title: data.title,
        description: data.description,
        ownerId: user.id
      } 
    });
  }

  async getAllQuizzes() {
    return this.prisma.quiz.findMany({
      include: { 
        questions: true,
        owner: true, // Missing owner include here
      },
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