import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Randevu tarihi ve saati' })
  @IsNotEmpty({ message: 'Randevu tarihi boş olamaz' })
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz' })
  date: string;

  @ApiProperty({ description: 'Randevu nedeni' })
  @IsNotEmpty({ message: 'Randevu nedeni boş olamaz' })
  @IsString({ message: 'Randevu nedeni metin olmalıdır' })
  reason: string;

  @ApiProperty({ description: 'Randevu notları', required: false })
  @IsOptional()
  @IsString({ message: 'Randevu notu metin olmalıdır' })
  notes?: string;

  @ApiProperty({ description: 'Randevu ücreti', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Randevu ücreti sayı olmalıdır' })
  cost?: number;
} 