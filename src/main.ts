import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filters';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: '*',
      methods: 'GET, HEAD,PUT, PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    const configService = app.get(ConfigService);
    const PORT = configService.getOrThrow<number>('PORT', 8000);

    const config = new DocumentBuilder()
      .setTitle('ShopWise AI')
      .setDescription('')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('shopwise')
      .addTag('users, users management endpoint')
      .addTag('sellers,sellers management endpoint')
      .addTag('customers, customers management endpoint')
      .addServer('http://localhost:8000/', 'Local development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: '/api-json',
      swaggerOptions: {
        persistAuthorization: true,
        tagSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'none',
        filter: true,
      },
      customCss: `
      swagger-ui .topbar { display: none; }`,
      customSiteTitle: 'HealthCare API Documentation',
    });

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    await app.listen(PORT);
    console.log(`Server is running on  http://localhost:${PORT}`);
    console.log(`Swagger is available at http://localhost:${PORT}/api/docs`);
  } catch (error) {
    console.error('Error during the application: ', error);
  }
}
bootstrap();
