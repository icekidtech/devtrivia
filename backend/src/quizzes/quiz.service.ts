import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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

  async publishQuiz(id: string) {
    try {
      // Check if the quiz exists and has questions
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
        include: { questions: true }
      });
      
      if (!quiz) {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }
      
      if (quiz.questions.length === 0) {
        throw new BadRequestException('Cannot publish a quiz with no questions');
      }
      
      // Generate unique join code
      let joinCode: string = '';
      let exists = true;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;
      
      while (exists && attempts < MAX_ATTEMPTS) {
        joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingQuiz = await this.prisma.quiz.findUnique({
          where: { joinCode },
        });
        exists = !!existingQuiz;
        attempts++;
      }
      
      if (attempts >= MAX_ATTEMPTS) {
        throw new InternalServerErrorException('Failed to generate unique join code');
      }
      
      // Update quiz with published flag and join code
      return this.prisma.quiz.update({
        where: { id },
        data: { 
          published: true,
          joinCode,
        },
        include: {
          owner: true,
          questions: {
            include: {
              answers: true
            }
          }
        }
      });
    } catch (error) {
      // Log the error for debugging
      console.error(`Error publishing quiz ${id}:`, error);
      
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof NotFoundException || 
        error instanceof BadRequestException || 
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      
      // Wrap other errors
      throw new InternalServerErrorException(
        `Failed to publish quiz: ${error.message || 'Unknown error'}`
      );
    }
  }

  async unpublishQuiz(id: string) {
    return this.prisma.quiz.update({
      where: { id },
      data: { 
        published: false,
        joinCode: null  // Remove the join code when unpublishing
      },
      include: {
        owner: true,
        questions: {
          include: {
            answers: true
          }
        }
      }
    });
  }

  async getQuizByJoinCode(joinCode: string) {
    return this.prisma.quiz.findUnique({
      where: { joinCode },
      include: {
        questions: {
          include: { 
            answers: true 
          }
        },
      },
    });
  }
}