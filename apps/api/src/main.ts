import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Silicon Valley Security Layer: Helmet headers
  app.use(helmet());

  // Input Sanitization & Validation (XSS & Injection Protection)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enterprise CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://10.2.0.2:3000',
      'http://10.2.0.2:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`UTP Control API is running on: http://localhost:${port}`);
}
bootstrap();
