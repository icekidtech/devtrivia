import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ResultWithRelations = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answersJson: string;
  createdAt: Date;
  // Add relations
  user: { id: string; name: string };
  quiz: { 
    id: string; 
    title: string;
    questions: Array<{
      id: string;
      text: string;
      quizId: string;
      answers: Array<{
        id: string;
        text: string;
        questionId: string;
        isCorrect: boolean;
      }>;
    }>;
  };
};

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  // Update createResult method
  async createResult(data: {
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number; // Time in ms taken to answer
    answers: Record<string, string>;
  }) {
    // Calculate time-based bonus points (faster answers get more points)
    // Maximum 10 points for speed, plus 10 points for correctness
    let timeBonus = 0;
    if (data.timeSpent < 3000) { // Less than 3 seconds
      timeBonus = 10;
    } else if (data.timeSpent < 5000) { // Less than 5 seconds
      timeBonus = 8;
    } else if (data.timeSpent < 10000) { // Less than 10 seconds
      timeBonus = 5;
    } else if (data.timeSpent < 15000) { // Less than 15 seconds
      timeBonus = 3;
    } else { // 15 seconds or more
      timeBonus = 1;
    }
    
    // Base score + time bonus (max 20 points per question)
    const totalScore = data.score + timeBonus;

    // Create the result
    const result = await this.prisma.result.create({
      data: {
        userId: data.userId,
        quizId: data.quizId,
        score: totalScore,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        // Store answers as JSON string
        answersJson: JSON.stringify(data.answers)
      },
    });

    return result;
  }

  async getResultById(id: string) {
    const result = await this.prisma.result.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    }) as unknown as ResultWithRelations;

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    // Parse answers JSON
    const answers = JSON.parse(result.answersJson || '{}');
    
    // Map questions with selected answers
    const questionResults = result.quiz.questions.map(question => {
      const selectedAnswerId = answers[question.id];
      const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
      const correctAnswer = question.answers.find(a => a.isCorrect);
      
      return {
        questionId: question.id,
        questionText: question.text,
        selectedAnswerId: selectedAnswerId || null,
        selectedAnswerText: selectedAnswer?.text || 'Not answered',
        correctAnswerId: correctAnswer?.id || null,
        correctAnswerText: correctAnswer?.text || 'No correct answer defined',
        isCorrect: selectedAnswerId === correctAnswer?.id,
      };
    });

    return {
      id: result.id,
      userId: result.userId,
      quizId: result.quizId,
      quizTitle: result.quiz.title,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      completedAt: result.createdAt,
      questionResults,
    };
  }

  async getResultsByUser(userId: string) {
    return this.prisma.result.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getResultsByQuiz(quizId: string) {
    return this.prisma.result.findMany({
      where: { quizId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    });
  }
}