import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Payment } from '../payments/payment.entity';
import { Radiograph } from '../radiographs/radiograph.entity';

@Entity('patients')
export class Patient {
  @PrimaryColumn({ type: 'varchar', length: 11 })
  tcNumber: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  registrationDate: Date;

  @OneToMany(() => Appointment, appointment => appointment.patient, { eager: true, cascade: true })
  appointments: Appointment[];

  @OneToMany(() => Payment, payment => payment.patient, { eager: true, cascade: true })
  payments: Payment[];

  @OneToMany(() => Radiograph, radiograph => radiograph.patient)
  radiographs: Radiograph[];

  @Column({ type: 'jsonb', nullable: true })
  teethNotes: {
    [key: string]: Array<{
      id: string;
      date: string;
      note: string;
      createdBy: string;
    }>;
  };
} 