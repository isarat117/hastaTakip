import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw } from 'typeorm';
import { Payment } from './payment.entity';
import { PatientsService } from '../patients/patients.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
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
    console.log('Gelen tarihler:', { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });

    // SQLite için tarih formatını ayarla
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // Ödemeleri getir
    const payments = await this.paymentsRepository.find({
      where: {
        date: Raw(dateAlias => `${dateAlias} BETWEEN :start AND :end`, {
          start: startStr,
          end: endStr
        })
      },
      relations: ['patient'],
    });

    console.log('Bulunan ödemeler:', payments.length);
    payments.forEach(payment => {
      console.log('Ödeme:', {
        date: payment.date,
        amount: payment.amount,
        patientName: payment.patient?.name
      });
    });

    // Randevuları getir
    const appointments = await this.appointmentsRepository.find({
      where: {
        date: Raw(dateAlias => `${dateAlias} BETWEEN :start AND :end`, {
          start: startStr,
          end: endStr
        })
      },
      relations: ['patient'],
    });

    console.log('Bulunan randevular:', appointments.length);
    appointments.forEach(appointment => {
      console.log('Randevu:', {
        date: appointment.date,
        cost: appointment.cost,
        patientName: appointment.patient?.name
      });
    });

    // Raw SQL ile kontrol
    const paymentsSql = await this.paymentsRepository.query(
      'SELECT p.*, pt.name as patientName FROM payment p ' +
      'LEFT JOIN patient pt ON p.patientTcNumber = pt.tcNumber ' +
      'WHERE p.date BETWEEN ? AND ?',
      [startStr, endStr]
    );
    console.log('SQL ile bulunan ödemeler:', paymentsSql);

    const appointmentsSql = await this.appointmentsRepository.query(
      'SELECT a.*, pt.name as patientName FROM appointment a ' +
      'LEFT JOIN patient pt ON a.patientTcNumber = pt.tcNumber ' +
      'WHERE a.date BETWEEN ? AND ?',
      [startStr, endStr]
    );
    console.log('SQL ile bulunan randevular:', appointmentsSql);

    // Toplam ödemeler
    const totalPayments = payments.reduce((sum, payment) => {
      const amount = Number(payment.amount) || 0;
      console.log('Ödeme tutarı:', amount);
      return sum + amount;
    }, 0);

    // Toplam borç (randevu ücretleri)
    const totalCost = appointments.reduce((sum, appointment) => {
      const cost = Number(appointment.cost) || 0;
      console.log('Randevu ücreti:', cost);
      return sum + cost;
    }, 0);

    console.log('Toplam tahsilat:', totalPayments);
    console.log('Toplam borç:', totalCost);

    // Detaylı ödeme bilgileri
    const paymentDetails = payments.map(payment => ({
      patientName: payment.patient?.name,
      patientTc: payment.patient?.tcNumber,
      date: payment.date,
      amount: payment.amount,
      notes: payment.notes,
    }));

    // Detaylı randevu bilgileri
    const appointmentDetails = appointments.map(appointment => ({
      patientName: appointment.patient?.name,
      patientTc: appointment.patient?.tcNumber,
      date: appointment.date,
      reason: appointment.reason,
      cost: appointment.cost,
      notes: appointment.notes,
    }));

    // Tarihleri sırala
    appointmentDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    paymentDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalCost,
      totalPayments,
      balance: totalPayments - totalCost,
      details: {
        appointments: appointmentDetails,
        payments: paymentDetails
      },
      summary: {
        totalDebt: totalCost,
        totalIncome: totalPayments,
        profitLoss: totalPayments - totalCost,
        appointmentCount: appointmentDetails.length,
        paymentCount: paymentDetails.length
      }
    };
  }
} 