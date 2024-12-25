import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from './payment.entity';
import { PatientsService } from '../patients/patients.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private patientsService: PatientsService,
  ) {}

  async create(tcNumber: string, paymentData: CreatePaymentDto): Promise<Payment> {
    const patient = await this.patientsService.findOne(tcNumber);
    const payment = this.paymentsRepository.create({
      ...paymentData,
      date: new Date(),
      patient,
    });
    return this.paymentsRepository.save(payment);
  }

  async findByPatient(tcNumber: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { patient: { tcNumber } },
      order: { date: 'DESC' },
    });
  }

  async getFinancialSummary(startDate: Date, endDate: Date) {
    const payments = await this.paymentsRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['patient'],
    });

    const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    const paymentDetails = payments.map(payment => ({
      patientName: payment.patient.name,
      patientTc: payment.patient.tcNumber,
      date: payment.date,
      amount: payment.amount,
      notes: payment.notes,
    }));

    return {
      totalPayments,
      paymentDetails,
    };
  }
} 