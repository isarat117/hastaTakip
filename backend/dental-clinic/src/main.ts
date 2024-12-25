import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS ayarları
  app.enableCors();
  
  // JSON body parser
  app.use(express.json());
  
  // Validasyon pipe'ı
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  
  // Statik dosya sunucusu
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Swagger konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle('Diş Kliniği API')
    .setDescription('Diş Kliniği Yönetim Sistemi API Dokümantasyonu')
    .setVersion('1.0')
    .addTag('hastalar', 'Hasta yönetimi ile ilgili endpointler')
    .addTag('randevular', 'Randevu yönetimi ile ilgili endpointler')
    .addTag('ödemeler', 'Ödeme yönetimi ile ilgili endpointler')
    .addTag('radyografiler', 'Radyografi yönetimi ile ilgili endpointler')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Uygulama ${port} portunda çalışıyor`);
  console.log(`API Dokümantasyonu: http://localhost:${port}/api/docs`);
}
bootstrap();
