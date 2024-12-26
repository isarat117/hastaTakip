import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Radiograph } from '../radiographs/radiograph.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp with time zone' })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @ManyToOne(() => Patient, patient => patient.appointments, { onDelete: 'CASCADE' })
  patient: Patient;

  @OneToMany(() => Radiograph, radiograph => radiograph.appointment, { eager: true })
  radiographs: Radiograph[];
} 