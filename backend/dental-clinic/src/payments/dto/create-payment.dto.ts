import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Ödeme tutarı' })
  @IsNotEmpty({ message: 'Ödeme tutarı boş olamaz' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Ödeme tutarı sayı olmalıdır' })
  amount: number;

  @ApiProperty({ description: 'Ödeme notları', required: false })
  @IsOptional()
  @IsString({ message: 'Ödeme notu metin olmalıdır' })
  notes?: string;
} 