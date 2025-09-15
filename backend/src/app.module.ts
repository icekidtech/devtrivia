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
import { PrismaModule } from './prisma/prisma.module';
import { ResultsModule } from './results/results.module';
import { QuizSessionsModule } from './quiz-sessions/quiz-sessions.module';
import { UserModule } from './users/user.module';
import { AdminInitService } from './admin/admin-init.service';

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
    PrismaModule,
    ResultsModule,
    QuizSessionsModule,
    UserModule,
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
    AdminInitService,
  ],
})
export class AppModule {}
