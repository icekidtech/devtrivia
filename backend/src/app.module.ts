import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
import { AuthController } from './auth/auth.controller';
import { AdminController } from './admin/admin.controller';
import { ResultsModule } from './results/results.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: `${configService.get<string>('JWT_EXPIRES_IN')}s` },
      }),
    }),
    ResultsModule,
  ],
  controllers: [
    AppController,
    QuizController,
    UserController,
    QuestionController,
    AnswerController,
    AuthController,
    AdminController,
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
