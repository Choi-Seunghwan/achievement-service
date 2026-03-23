import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/logging-interceptor';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 보안 헤더 설정
  app.use(helmet());

  app.enableCors({
    origin: process.env.CLIENT_URL.split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 전역 예외 필터 등록
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(Number(process.env.SERVER_PORT));
}
bootstrap();
