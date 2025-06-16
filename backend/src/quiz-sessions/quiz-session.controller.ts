import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { QuizSessionService } from './quiz-session.service';

@Controller('quizzes')
export class QuizSessionController {
  constructor(private readonly quizSessionService: QuizSessionService) {}

  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return this.quizSessionService.getParticipants(id);
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') id: string,
    @Body() data: { userId: string; name: string },
  ) {
    return this.quizSessionService.addParticipant(id, data.userId, data.name);
  }

  @Patch(':id/start')
  async startQuiz(@Param('id') id: string) {
    return this.quizSessionService.startQuiz(id);
  }

  @Patch(':id/next-question')
  async nextQuestion(
    @Param('id') id: string,
    @Body() data: { questionIndex: number },
  ) {
    return this.quizSessionService.nextQuestion(id, data.questionIndex);
  }

  @Patch(':id/end')
  async endQuiz(@Param('id') id: string) {
    return this.quizSessionService.endQuiz(id);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string) {
    return this.quizSessionService.getLeaderboard(id);
  }

  @Get(':id/status')
  async getQuizStatus(@Param('id') id: string) {
    return this.quizSessionService.getQuizStatus(id);
  }
}