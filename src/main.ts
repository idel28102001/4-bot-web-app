import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as nunjucks from 'nunjucks';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  nunjucks.configure('views', {
    autoescape: true,
    express: app,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipNullProperties: true,
    }),
  );
  await app.listen(process.env.PORT);
}

bootstrap();
