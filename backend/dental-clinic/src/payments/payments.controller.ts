import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './payment.entity';

@ApiTags('ödemeler')
@Controller('api')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('patients/:tcNumber/payments')
  @ApiOperation({ summary: 'Yeni ödeme ekle' })
  @ApiResponse({ status: 201, description: 'Ödeme başarıyla eklendi' })
  create(
    @Param('tcNumber') tcNumber: string,
    @Body() paymentData: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.create(tcNumber, paymentData);
  }

  @Get('patients/:tcNumber/payments')
  @ApiOperation({ summary: 'Hastanın tüm ödemelerini getir' })
  @ApiResponse({ status: 200, description: 'Ödemeler başarıyla getirildi' })
  findByPatient(@Param('tcNumber') tcNumber: string): Promise<Payment[]> {
    return this.paymentsService.findByPatient(tcNumber);
  }

  @Get('financial-summary')
  @ApiOperation({ summary: 'Mali özet raporu al' })
  @ApiResponse({ status: 200, description: 'Mali özet başarıyla getirildi' })
  async getFinancialSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Başlangıç ve bitiş tarihleri gereklidir');
    }

    console.log('Gelen tarih parametreleri:', { startDate, endDate });

    try {
      // Tarihleri parçala
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

      // Geçerli tarih kontrolü
      if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
        throw new BadRequestException('Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.');
      }

      // Tarihleri oluştur
      const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
      const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Geçersiz tarih');
      }

      console.log('Dönüştürülen tarihler:', {
        start: start.toISOString(),
        end: end.toISOString(),
        startLocal: start.toLocaleString(),
        endLocal: end.toLocaleString()
      });

      const result = await this.paymentsService.getFinancialSummary(start, end);
      console.log('Mali özet sonucu:', result);
      return result;
    } catch (error) {
      console.error('Mali özet hatası:', error);
      throw new BadRequestException(`Mali özet alınırken hata oluştu: ${error.message}`);
    }
  }
} 