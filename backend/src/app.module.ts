import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { QuizController } from './quizzes/quiz.controller';
import { QuizService } from './quizzes/quiz.service';

@Module({
  imports: [],
  controllers: [AppController, QuizController],
  providers: [AppService, PrismaService, QuizService],
})
export class AppModule {}
