import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PaymentsModule } from './payments/payments.module';
import { RadiographsModule } from './radiographs/radiographs.module';
import { Patient } from './patients/patient.entity';
import { Appointment } from './appointments/appointment.entity';
import { Payment } from './payments/payment.entity';
import { Radiograph } from './radiographs/radiograph.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'dental_clinic',
      entities: [Patient, Appointment, Payment, Radiograph],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/radiographs',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(new Error('Sadece görüntü dosyaları yüklenebilir.'), false);
        }
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PatientsModule,
    AppointmentsModule,
    PaymentsModule,
    RadiographsModule,
  ],
})
export class AppModule {
  constructor() {
    // Gerekli dizinleri oluştur
    const fs = require('fs');
    const path = require('path');
    
    const dirs = [
      'uploads',
      'uploads/radiographs'
    ];

    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }
}