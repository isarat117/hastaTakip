import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Radiograph } from './radiograph.entity';
import { RadiographsController } from './radiographs.controller';
import { RadiographsService } from './radiographs.service';
import { PatientsModule } from '../patients/patients.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Radiograph]),
    PatientsModule,
    AppointmentsModule,
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
  ],
  controllers: [RadiographsController],
  providers: [RadiographsService],
  exports: [RadiographsService],
})
export class RadiographsModule {} 