import { Body, Controller, Delete, Get, Param, Post, Patch, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async createQuiz(@Body() body: { title: string; description?: string; ownerName: string }) {
    return this.quizService.createQuiz(body);
  }

  @Get()
  async getAllQuizzes() {
    return this.quizService.getAllQuizzes();
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    try {
      return await this.quizService.getQuizById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':id/leaderboard')
  async getQuizLeaderboard(@Param('id') id: string) {
    return this.quizService.getQuizLeaderboard(id);
  }

  @Delete(':id')
  async deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }

  @Patch(':id/publish')
  async publishQuiz(@Param('id') id: string) {
    return this.quizService.publishQuiz(id);
  }

  @Patch(':id/unpublish')
  async unpublishQuiz(@Param('id') id: string) {
    return this.quizService.unpublishQuiz(id);
  }

  @Get('join/:code')
  async getQuizByJoinCode(@Param('code') code: string) {
    const quiz = await this.quizService.getQuizByJoinCode(code);
    if (!quiz || !quiz.published) {
      throw new NotFoundException('Quiz not found or not published');
    }
    return quiz;
  }
}