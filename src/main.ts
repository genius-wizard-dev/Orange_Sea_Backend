import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const cors = {
    origin: ['*'],
    methods: 'GET, POST, PATCH, DELETE, PUT, OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, x-device-id, x-fcm-token, r-key',
    credentials: true,
  };
  app.enableCors(cors);
  const config = new DocumentBuilder()
    .setTitle('Orange Sea API')
    .setDescription(
      `
    # Tài liệu API

    ## Giới thiệu
    Đây là tài liệu mô tả các API của hệ thống.

    ## Hướng dẫn xác thực
    1. Đầu tiên, sử dụng API \`/api/auth/login\` để đăng nhập và lấy JWT token
    2. Nhấp vào nút "Authorize" ở góc trên cùng bên phải màn hình
    3. Nhập token theo định dạng: \`Bearer Your_Token\`
    4. Nhấp vào "Authorize" để áp dụng token cho tất cả các API có yêu cầu xác thực

    ## Lưu ý
    - Tất cả các API yêu cầu xác thực đều được đánh dấu bằng biểu tượng khóa
    - Bạn có thể truy cập JSON của Swagger tại: \`/swagger-json\`
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập token JWT của bạn',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const documentFactory = () => document;
  const swaggerOptions = {
    swaggerOptions: {
      requestInterceptor: (req) => {
        req.headers['x-device-id'] = 'default-device-id';
        req.headers['x-fcm-token'] = 'default-fcm-token';
        return req;
      },
    },
  };

  // Tạo route để truy cập JSON document
  app.use('/swagger-json', (req, res) => {
    res.json(document);
  });

  SwaggerModule.setup('swagger', app, documentFactory, swaggerOptions);
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
