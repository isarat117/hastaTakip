import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRadiographDto {
  @ApiProperty({ description: 'Diş numarası' })
  @IsNotEmpty({ message: 'Diş numarası boş olamaz' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Diş numarası sayı olmalıdır' })
  toothNumber: number;

  @ApiProperty({ description: 'Radyografi tipi' })
  @IsNotEmpty({ message: 'Görüntü tipi boş olamaz' })
  @IsString({ message: 'Görüntü tipi metin olmalıdır' })
  type: string;

  @ApiProperty({ description: 'Teşhis', required: false })
  @IsOptional()
  @IsString({ message: 'Teşhis metin olmalıdır' })
  diagnosis?: string;

  @ApiProperty({ description: 'Radyografi notları', required: false })
  @IsOptional()
  @IsString({ message: 'Notlar metin olmalıdır' })
  notes?: string;

  @ApiProperty({ description: 'Randevu ID', required: false })
  @IsOptional()
  @IsString({ message: 'Randevu ID metin olmalıdır' })
  appointmentId?: string;
} 