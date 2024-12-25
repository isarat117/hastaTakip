import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Payment } from '../payments/payment.entity';
import { Radiograph } from '../radiographs/radiograph.entity';

@Entity()
export class Patient {
  @PrimaryColumn()
  tcNumber: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @CreateDateColumn()
  registrationDate: Date;

  @OneToMany(() => Appointment, appointment => appointment.patient, { eager: true, cascade: true })
  appointments: Appointment[];

  @OneToMany(() => Payment, payment => payment.patient, { eager: true, cascade: true })
  payments: Payment[];

  @OneToMany(() => Radiograph, radiograph => radiograph.patient)
  radiographs: Radiograph[];

  @Column('simple-json', { nullable: true })
  teethNotes: {
    [key: string]: Array<{
      id: string;
      date: string;
      note: string;
      createdBy: string;
    }>;
  };
} 