import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find();
  }

  async findOne(tcNumber: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({ where: { tcNumber } });
    if (!patient) {
      throw new NotFoundException('Hasta bulunamadı');
    }
    return patient;
  }

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientsRepository.create({
      ...patientData,
      registrationDate: new Date(),
    });
    return this.patientsRepository.save(patient);
  }

  async update(tcNumber: string, patientData: Partial<Patient>): Promise<Patient> {
    const patient = await this.findOne(tcNumber);
    Object.assign(patient, patientData);
    return this.patientsRepository.save(patient);
  }

  async remove(tcNumber: string): Promise<void> {
    const result = await this.patientsRepository.delete(tcNumber);
    if (result.affected === 0) {
      throw new NotFoundException('Hasta bulunamadı');
    }
  }

  async addToothNote(tcNumber: string, toothNumber: string, note: { note: string; createdBy: string }): Promise<Patient> {
    const patient = await this.findOne(tcNumber);
    if (!patient.teethNotes) {
      patient.teethNotes = {};
    }
    if (!patient.teethNotes[toothNumber]) {
      patient.teethNotes[toothNumber] = [];
    }

    const newNote = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...note,
    };

    patient.teethNotes[toothNumber].push(newNote);
    return this.patientsRepository.save(patient);
  }

  async getToothNotes(tcNumber: string, toothNumber: string): Promise<any[]> {
    const patient = await this.findOne(tcNumber);
    return patient.teethNotes?.[toothNumber] || [];
  }

  async getAllTeethNotes(tcNumber: string): Promise<Record<string, any[]>> {
    const patient = await this.findOne(tcNumber);
    return patient.teethNotes || {};
  }

  async deleteToothNote(tcNumber: string, toothNumber: string, noteId: string): Promise<void> {
    const patient = await this.findOne(tcNumber);
    if (!patient.teethNotes?.[toothNumber]) {
      throw new NotFoundException('Not bulunamadı');
    }

    const notes = patient.teethNotes[toothNumber];
    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new NotFoundException('Not bulunamadı');
    }

    notes.splice(noteIndex, 1);

    if (notes.length === 0) {
      delete patient.teethNotes[toothNumber];
    }

    await this.patientsRepository.save(patient);
  }
} 