import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  async createAnswer(data: { text: string; questionId: string }) {
    const questionExists = await this.prisma.question.findUnique({
      where: { id: data.questionId },
    });

    if (!questionExists) {
      throw new Error('Question does not exist');
    }

    return this.prisma.answer.create({
      data,
    });
  }

  async updateAnswer(id: string, data: { text?: string }) {
    return this.prisma.answer.update({
      where: { id },
      data,
    });
  }

  async deleteAnswer(id: string) {
    return this.prisma.answer.delete({
      where: { id },
    });
  }

  async getAnswersByQuestion(questionId: string) {
    return this.prisma.answer.findMany({
      where: { questionId },
    });
  }
}