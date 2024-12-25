import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Radiograph } from './radiograph.entity';
import { PatientsService } from '../patients/patients.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { CreateRadiographDto } from './dto/create-radiograph.dto';
import { UpdateRadiographDto } from './dto/update-radiograph.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class RadiographsService {
  constructor(
    @InjectRepository(Radiograph)
    private radiographsRepository: Repository<Radiograph>,
    private patientsService: PatientsService,
    private appointmentsService: AppointmentsService,
  ) {}

  async create(
    tcNumber: string,
    radiographData: CreateRadiographDto,
    file: Express.Multer.File,
  ): Promise<Radiograph> {
    const patient = await this.patientsService.findOne(tcNumber);
    let appointment = null;

    if (radiographData.appointmentId) {
      appointment = await this.appointmentsService.findOne(radiographData.appointmentId);
    }

    if (!file) {
      throw new BadRequestException('Görüntü dosyası gereklidir');
    }

    const radiograph = this.radiographsRepository.create({
      ...radiographData,
      patientTc: tcNumber,
      date: new Date(),
      imagePath: `/uploads/radiographs/${file.filename}`,
      patient,
      appointment,
    });

    return this.radiographsRepository.save(radiograph);
  }

  async findOne(id: string): Promise<Radiograph> {
    const radiograph = await this.radiographsRepository.findOne({
      where: { id },
      relations: ['patient', 'appointment'],
    });

    if (!radiograph) {
      throw new NotFoundException('Radyografi bulunamadı');
    }

    return radiograph;
  }

  async findByPatient(tcNumber: string): Promise<Radiograph[]> {
    return this.radiographsRepository.find({
      where: { patientTc: tcNumber },
      order: { date: 'DESC' },
      relations: ['appointment'],
    });
  }

  async findByAppointment(appointmentId: string): Promise<Radiograph[]> {
    return this.radiographsRepository.find({
      where: { appointmentId },
      relations: ['patient'],
    });
  }

  async update(id: string, updateData: UpdateRadiographDto): Promise<Radiograph> {
    const radiograph = await this.findOne(id);
    Object.assign(radiograph, updateData);
    return this.radiographsRepository.save(radiograph);
  }

  async remove(id: string): Promise<void> {
    const radiograph = await this.findOne(id);

    try {
      const filePath = path.join(process.cwd(), radiograph.imagePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Dosya silinirken hata:', error);
    }

    const result = await this.radiographsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Radyografi bulunamadı');
    }
  }
} 