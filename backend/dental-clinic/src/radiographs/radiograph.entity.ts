import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity('radiographs')
export class Radiograph {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 11 })
  patientTc: string;

  @Column({ type: 'uuid' })
  appointmentId: string;

  @Column({ type: 'integer' })
  toothNumber: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  imagePath: string;

  @Column({ type: 'jsonb', nullable: true })
  toothNotes: Record<string, any>;

  @ManyToOne(() => Patient, patient => patient.radiographs, { onDelete: 'CASCADE' })
  patient: Patient;

  @ManyToOne(() => Appointment, appointment => appointment.radiographs, { onDelete: 'CASCADE' })
  appointment: Appointment;
} 