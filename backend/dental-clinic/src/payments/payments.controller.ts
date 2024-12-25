import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
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

  @Get('payments/financial-summary')
  @ApiOperation({ summary: 'Mali özet raporu al' })
  @ApiResponse({ status: 200, description: 'Mali özet başarıyla getirildi' })
  async getFinancialSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.paymentsService.getFinancialSummary(start, end);
  }
} 