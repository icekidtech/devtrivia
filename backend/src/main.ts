import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for your frontend
  app.enableCors({
    origin: [
      'http://localhost:3001', // Local development
      'https://devtrivia.vercel.app' // Production frontend URL
    ],
    credentials: true,
  });

  // Use PORT from environment variable (Render provides this)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces
  
  console.log(`Application is running on port ${port}`);
}
bootstrap();
