import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async createQuiz(@Body() body: { title: string; description?: string; ownerId: string }) {
    return this.quizService.createQuiz(body);
  }

  @Get()
  async getAllQuizzes() {
    return this.quizService.getAllQuizzes();
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  @Delete(':id')
  async deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }
}