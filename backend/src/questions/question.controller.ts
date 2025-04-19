import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  async createQuestion(@Body() body: { text: string; quizId: string }) {
    return this.questionService.createQuestion(body);
  }

  @Patch(':id')
  async updateQuestion(@Param('id') id: string, @Body() body: { text?: string }) {
    return this.questionService.updateQuestion(id, body);
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }
}
