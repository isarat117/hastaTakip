import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { RadiographsService } from './radiographs.service';
import { CreateRadiographDto } from './dto/create-radiograph.dto';
import { UpdateRadiographDto } from './dto/update-radiograph.dto';
import { Radiograph } from './radiograph.entity';

@ApiTags('radyografiler')
@Controller('api')
export class RadiographsController {
  constructor(private readonly radiographsService: RadiographsService) {}

  @Post('patients/:tcNumber/radiographs')
  @ApiOperation({ summary: 'Yeni radyografi ekle' })
  @ApiResponse({ status: 201, description: 'Radyografi başarıyla eklendi' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Param('tcNumber') tcNumber: string,
    @Body() radiographData: CreateRadiographDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Radiograph> {
    return this.radiographsService.create(tcNumber, radiographData, file);
  }

  @Get('radiographs/:id')
  @ApiOperation({ summary: 'Belirli bir radyografiyi getir' })
  @ApiResponse({ status: 200, description: 'Radyografi başarıyla getirildi' })
  findOne(@Param('id') id: string): Promise<Radiograph> {
    return this.radiographsService.findOne(id);
  }

  @Get('patients/:tcNumber/radiographs')
  @ApiOperation({ summary: 'Hastanın tüm radyografilerini getir' })
  @ApiResponse({ status: 200, description: 'Radyografiler başarıyla getirildi' })
  findByPatient(@Param('tcNumber') tcNumber: string): Promise<Radiograph[]> {
    return this.radiographsService.findByPatient(tcNumber);
  }

  @Get('appointments/:appointmentId/radiographs')
  @ApiOperation({ summary: 'Randevuya ait radyografileri getir' })
  @ApiResponse({ status: 200, description: 'Radyografiler başarıyla getirildi' })
  findByAppointment(@Param('appointmentId') appointmentId: string): Promise<Radiograph[]> {
    return this.radiographsService.findByAppointment(appointmentId);
  }

  @Put('radiographs/:id')
  @ApiOperation({ summary: 'Radyografi bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Radyografi başarıyla güncellendi' })
  update(
    @Param('id') id: string,
    @Body() updateData: UpdateRadiographDto,
  ): Promise<Radiograph> {
    return this.radiographsService.update(id, updateData);
  }

  @Delete('radiographs/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Radyografi kaydını sil' })
  @ApiResponse({ status: 204, description: 'Radyografi başarıyla silindi' })
  remove(@Param('id') id: string): Promise<void> {
    return this.radiographsService.remove(id);
  }
} 