import { Controller, Get, Post, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  async createResult(@Body() data: {
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    answers: Record<string, string>;
    timeSpent: number;  // Make sure this field is included in the DTO
  }) {
    return await this.resultsService.createResult(data);
  }

  @Get(':id')
  async getResultById(@Param('id') id: string) {
    return await this.resultsService.getResultById(id);
  }

  @Get('user/:userId')
  async getResultsByUser(@Param('userId') userId: string) {
    return await this.resultsService.getResultsByUser(userId);
  }

  @Get('quiz/:quizId')
  async getResultsByQuiz(@Param('quizId') quizId: string) {
    return await this.resultsService.getResultsByQuiz(quizId);
  }
}