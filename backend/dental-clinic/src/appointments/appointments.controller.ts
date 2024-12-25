import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './appointment.entity';

@ApiTags('randevular')
@Controller('api')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('patients/:tcNumber/appointments')
  @ApiOperation({ summary: 'Yeni randevu oluştur' })
  @ApiResponse({ status: 201, description: 'Randevu başarıyla oluşturuldu' })
  create(
    @Param('tcNumber') tcNumber: string,
    @Body() appointmentData: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.create(tcNumber, appointmentData);
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Belirli bir randevuyu getir' })
  @ApiResponse({ status: 200, description: 'Randevu başarıyla getirildi' })
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Get('patients/:tcNumber/appointments')
  @ApiOperation({ summary: 'Hastanın tüm randevularını getir' })
  @ApiResponse({ status: 200, description: 'Randevular başarıyla getirildi' })
  findByPatient(@Param('tcNumber') tcNumber: string): Promise<Appointment[]> {
    return this.appointmentsService.findByPatient(tcNumber);
  }

  @Put('appointments/:id')
  @ApiOperation({ summary: 'Randevu bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Randevu başarıyla güncellendi' })
  update(
    @Param('id') id: string,
    @Body() appointmentData: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, appointmentData);
  }

  @Delete('appointments/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Randevu kaydını sil' })
  @ApiResponse({ status: 204, description: 'Randevu başarıyla silindi' })
  remove(@Param('id') id: string): Promise<void> {
    return this.appointmentsService.remove(id);
  }
} 