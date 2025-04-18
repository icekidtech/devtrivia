import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { QuizController } from './quizzes/quiz.controller';
import { QuizService } from './quizzes/quiz.service';
import { UserController } from './users/user.controller';

@Module({
  imports: [],
  controllers: [AppController, QuizController, UserController],
  providers: [AppService, PrismaService, QuizService],
})
export class AppModule {}
