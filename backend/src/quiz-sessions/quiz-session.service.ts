import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizSessionService {
  constructor(private prisma: PrismaService) {}

  async getParticipants(quizId: string) {
    // Verify the quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Return all participants for this quiz
    return this.prisma.quizParticipant.findMany({
      where: { quizId },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addParticipant(quizId: string, userId: string, name: string) {
    // Check if quiz exists and is published
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    if (!quiz.published) {
      throw new Error('Cannot join an unpublished quiz');
    }

    // Check if participant already exists
    const existingParticipant = await this.prisma.quizParticipant.findFirst({
      where: {
        quizId,
        userId,
      },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    // Add new participant
    return this.prisma.quizParticipant.create({
      data: {
        quizId,
        userId,
        name,
        joinedAt: new Date(),
      },
    });
  }

  async startQuiz(quizId: string) {
    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    if (quiz.questions.length === 0) {
      throw new Error('Cannot start a quiz with no questions');
    }

    // Update quiz to active state
    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        active: true,
        currentQuestionIndex: 0,
      },
    });
  }

  async nextQuestion(quizId: string, questionIndex: number) {
    // Validate that quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      throw new Error(`Invalid question index: ${questionIndex}`);
    }

    // Update current question index
    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        currentQuestionIndex: questionIndex,
      },
    });
  }

  async endQuiz(quizId: string) {
    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Update quiz status to inactive and unpublish it
    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        active: false,
        published: false,
        joinCode: null, // Remove join code when quiz ends
      },
    });
  }

  async getLeaderboard(quizId: string) {
    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Get results for this quiz, sorted by score
    const results = await this.prisma.result.findMany({
      where: { quizId },
      select: {
        id: true,
        userId: true,
        score: true,
        correctAnswers: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    // Format results for leaderboard
    return results.map(result => ({
      resultId: result.id,
      userId: result.userId,
      userName: result.user?.name || 'Unknown User',
      score: result.score,
      correctCount: result.correctAnswers,
    }));
  }

  async getQuizStatus(quizId: string) {
    // Return the current quiz state
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        published: true,
        active: true,
        currentQuestionIndex: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    return quiz;
  }
}