import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity()
export class Radiograph {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientTc: string;

  @Column()
  appointmentId: string;

  @Column()
  toothNumber: number;

  @CreateDateColumn()
  date: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  diagnosis: string;

  @Column()
  type: string;

  @Column()
  imagePath: string;

  @Column('simple-json', { nullable: true })
  toothNotes: Record<string, any>;

  @ManyToOne(() => Patient, patient => patient.radiographs, { onDelete: 'CASCADE' })
  patient: Patient;

  @ManyToOne(() => Appointment, appointment => appointment.radiographs, { onDelete: 'CASCADE' })
  appointment: Appointment;
} 