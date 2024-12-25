import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Radiograph } from '../radiographs/radiograph.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column()
  reason: string;

  @Column({ nullable: true })
  notes: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cost: number;

  @ManyToOne(() => Patient, patient => patient.appointments, { onDelete: 'CASCADE' })
  patient: Patient;

  @OneToMany(() => Radiograph, radiograph => radiograph.appointment, { eager: true })
  radiographs: Radiograph[];
} 