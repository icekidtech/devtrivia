import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'https://your-production-domain.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
