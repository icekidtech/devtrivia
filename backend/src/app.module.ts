import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { QuizController } from './quizzes/quiz.controller';
import { QuizService } from './quizzes/quiz.service';
import { UserController } from './users/user.controller';
import { QuestionController } from './questions/question.controller';
import { QuestionService } from './questions/question.service';
import { AnswerController } from './answers/answer.controller';
import { AnswerService } from './answers/answer.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    QuizController,
    UserController,
    QuestionController,
    AnswerController,
  ],
  providers: [
    AppService,
    PrismaService,
    QuizService,
    QuestionService,
    AnswerService,
  ],
})
export class AppModule {}
