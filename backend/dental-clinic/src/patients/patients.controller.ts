import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Patient } from './patient.entity';

@ApiTags('hastalar')
@Controller('api/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm hastaları getir' })
  @ApiResponse({ status: 200, description: 'Hastalar başarıyla getirildi' })
  findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Get(':tcNumber')
  @ApiOperation({ summary: 'Belirli bir hastayı getir' })
  @ApiResponse({ status: 200, description: 'Hasta başarıyla getirildi' })
  findOne(@Param('tcNumber') tcNumber: string): Promise<Patient> {
    return this.patientsService.findOne(tcNumber);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni hasta ekle' })
  @ApiResponse({ status: 201, description: 'Hasta başarıyla eklendi' })
  create(@Body() patientData: Partial<Patient>): Promise<Patient> {
    return this.patientsService.create(patientData);
  }

  @Put(':tcNumber')
  @ApiOperation({ summary: 'Hasta bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Hasta başarıyla güncellendi' })
  update(
    @Param('tcNumber') tcNumber: string,
    @Body() patientData: Partial<Patient>,
  ): Promise<Patient> {
    return this.patientsService.update(tcNumber, patientData);
  }

  @Delete(':tcNumber')
  @HttpCode(204)
  @ApiOperation({ summary: 'Hasta kaydını sil' })
  @ApiResponse({ status: 204, description: 'Hasta başarıyla silindi' })
  remove(@Param('tcNumber') tcNumber: string): Promise<void> {
    return this.patientsService.remove(tcNumber);
  }

  @Post(':tcNumber/teeth/:toothNumber/notes')
  @ApiOperation({ summary: 'Diş notu ekle' })
  @ApiResponse({ status: 201, description: 'Diş notu başarıyla eklendi' })
  addToothNote(
    @Param('tcNumber') tcNumber: string,
    @Param('toothNumber') toothNumber: string,
    @Body() note: { note: string; createdBy: string },
  ): Promise<Patient> {
    return this.patientsService.addToothNote(tcNumber, toothNumber, note);
  }

  @Get(':tcNumber/teeth/:toothNumber/notes')
  @ApiOperation({ summary: 'Belirli bir dişin notlarını getir' })
  @ApiResponse({ status: 200, description: 'Diş notları başarıyla getirildi' })
  getToothNotes(
    @Param('tcNumber') tcNumber: string,
    @Param('toothNumber') toothNumber: string,
  ): Promise<any[]> {
    return this.patientsService.getToothNotes(tcNumber, toothNumber);
  }

  @Get(':tcNumber/teeth/notes')
  @ApiOperation({ summary: 'Hastanın tüm diş notlarını getir' })
  @ApiResponse({ status: 200, description: 'Diş notları başarıyla getirildi' })
  getAllTeethNotes(@Param('tcNumber') tcNumber: string): Promise<Record<string, any[]>> {
    return this.patientsService.getAllTeethNotes(tcNumber);
  }

  @Delete(':tcNumber/teeth/:toothNumber/notes/:noteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Diş notunu sil' })
  @ApiResponse({ status: 204, description: 'Diş notu başarıyla silindi' })
  deleteToothNote(
    @Param('tcNumber') tcNumber: string,
    @Param('toothNumber') toothNumber: string,
    @Param('noteId') noteId: string,
  ): Promise<void> {
    return this.patientsService.deleteToothNote(tcNumber, toothNumber, noteId);
  }
} 