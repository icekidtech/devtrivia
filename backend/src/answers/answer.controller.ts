import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  async createAnswer(@Body() body: { text: string; questionId: string }) {
    return this.answerService.createAnswer(body);
  }

  @Patch(':id')
  async updateAnswer(@Param('id') id: string, @Body() body: { text?: string }) {
    return this.answerService.updateAnswer(id, body);
  }

  @Delete(':id')
  async deleteAnswer(@Param('id') id: string) {
    return this.answerService.deleteAnswer(id);
  }

  @Get('question/:questionId')
  async getAnswersByQuestion(@Param('questionId') questionId: string) {
    return this.answerService.getAnswersByQuestion(questionId);
  }
}