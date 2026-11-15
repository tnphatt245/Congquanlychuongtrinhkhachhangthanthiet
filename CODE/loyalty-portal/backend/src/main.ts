import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Mở CORS để cho phép ứng dụng Frontend kết nối
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // 2. Kích hoạt Validation Pipe toàn cục (Tự động lọc và bắt lỗi DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field thừa không khai báo trong DTO
      forbidNonWhitelisted: true, // Chặn nếu truyền field không có trong DTO
      transform: true, // Tự động ép kiểu dữ liệu phù hợp với DTO
    }),
  );

  // 3. Kích hoạt Chuẩn hóa Response thành công & Bẫy lỗi toàn cục
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Cấu hình Tài liệu Swagger API
  const config = new DocumentBuilder()
    .setTitle('Loyalty Program System API')
    .setDescription('Hệ thống Quản lý Khách hàng thân thiết, Tích điểm & Đổi quà')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Loyalty Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  console.log(`📖 Tài liệu Swagger API tại: http://localhost:${port}/api`);
}
bootstrap();