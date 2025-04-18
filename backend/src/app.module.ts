import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { QuizController } from './quizzes/quiz.controller';
import { QuizService } from './quizzes/quiz.service';
import { UserController } from './users/user.controller';
import { QuestionController } from './questions/question.controller';
import { QuestionService } from './questions/question.service';

@Module({
  imports: [],
  controllers: [AppController, QuizController, UserController, QuestionController],
  providers: [AppService, PrismaService, QuizService, QuestionService],
})
export class AppModule {}
