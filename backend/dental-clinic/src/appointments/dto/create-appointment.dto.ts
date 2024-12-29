import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsArray, ArrayMinSize, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Randevu tarihi' })
  @IsNotEmpty({ message: 'Randevu tarihi boş olamaz' })
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz' })
  date: string;

  @ApiProperty({ description: 'Randevu saati (Format: HH:mm)' })
  @IsNotEmpty({ message: 'Randevu saati boş olamaz' })
  @IsString({ message: 'Randevu saati metin olmalıdır' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Randevu saati HH:mm formatında olmalıdır' })
  time: string;

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

  @ApiProperty({ description: 'İşlem yapılacak diş numaraları', type: [Number], required: false })
  @IsOptional()
  @IsArray({ message: 'Diş numaraları bir dizi olmalıdır' })
  @ArrayMinSize(1, { message: 'En az bir diş numarası girilmelidir' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'Diş numaraları sayı olmalıdır' })
  toothNumbers?: number[];
} 