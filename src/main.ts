import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const cors = {
    origin: ['http://localhost:3000', '*'],
    methods: 'GET, POST, PATCH, DELETE, PUT, OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, x-device-id, x-fcm-token, r-key',
    credentials: true,
  };
  app.enableCors(cors);
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
