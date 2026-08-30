import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // const ConfigService = app.get(ConfigService);
  // const PORT = ConfigService.getOrThrow<number>('PORT');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
