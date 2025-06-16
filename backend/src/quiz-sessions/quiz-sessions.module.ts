import { Module } from '@nestjs/common';
import { QuizSessionController } from './quiz-session.controller';
import { QuizSessionService } from './quiz-session.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuizSessionController],
  providers: [QuizSessionService],
  exports: [QuizSessionService],
})
export class QuizSessionsModule {}