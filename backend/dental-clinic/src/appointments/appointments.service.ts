import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { PatientsService } from '../patients/patients.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private patientsService: PatientsService,
  ) {}

  async create(tcNumber: string, appointmentData: CreateAppointmentDto): Promise<Appointment> {
    const patient = await this.patientsService.findOne(tcNumber);
    const appointmentDate = new Date(appointmentData.date);
    
    // Saat bilgisini ayarla
    const [hours, minutes] = appointmentData.time.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();

    if (appointmentDate < now) {
      throw new BadRequestException('Geçmiş bir tarih için randevu oluşturulamaz');
    }

    // Çakışma kontrolü
    const existingAppointments = await this.appointmentsRepository.find({
      where: { patient: { tcNumber } },
    });

    const hasConflict = existingAppointments.some(apt => {
      const existingDate = new Date(apt.date);
      return Math.abs(existingDate.getTime() - appointmentDate.getTime()) < 30 * 60 * 1000;
    });

    if (hasConflict) {
      throw new BadRequestException('Bu tarih ve saatte başka bir randevu bulunmaktadır');
    }

    const appointment = this.appointmentsRepository.create({
      ...appointmentData,
      date: appointmentDate,
      patient,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı');
    }

    return appointment;
  }

  async findByPatient(tcNumber: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { patient: { tcNumber } },
      order: { date: 'DESC' },
    });
  }

  async update(id: string, appointmentData: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, appointmentData);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Randevu bulunamadı');
    }
  }
} 