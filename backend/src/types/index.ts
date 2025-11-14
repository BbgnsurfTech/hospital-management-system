import { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  PHARMACIST = 'pharmacist',
  LAB_TECHNICIAN = 'lab_technician',
  RADIOLOGIST = 'radiologist',
  BILLING = 'billing'
}

export enum PatientStatus {
  REGISTERED = 'registered',
  WAITING = 'waiting',
  IN_CONSULTATION = 'in_consultation',
  AWAITING_TESTS = 'awaiting_tests',
  TESTS_IN_PROGRESS = 'tests_in_progress',
  AWAITING_RESULTS = 'awaiting_results',
  AT_PHARMACY = 'at_pharmacy',
  AT_BILLING = 'at_billing',
  COMPLETED = 'completed',
  ADMITTED = 'admitted'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum TestStatus {
  ORDERED = 'ordered',
  SAMPLE_COLLECTED = 'sample_collected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REPORTED = 'reported',
  CRITICAL = 'critical'
}

export enum PrescriptionStatus {
  PENDING = 'pending',
  DISPENSED = 'dispensed',
  PARTIALLY_DISPENSED = 'partially_dispensed',
  COMPLETED = 'completed'
}

export enum NotificationType {
  PATIENT_REGISTERED = 'patient_registered',
  PATIENT_WAITING = 'patient_waiting',
  CONSULTATION_STARTED = 'consultation_started',
  PRESCRIPTION_ISSUED = 'prescription_issued',
  TEST_ORDERED = 'test_ordered',
  TEST_RESULT_READY = 'test_result_ready',
  CRITICAL_RESULT = 'critical_result',
  MEDICATION_READY = 'medication_ready',
  BILLING_PENDING = 'billing_pending'
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone: string;
  address: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    validUntil: Date;
  };
  medicalHistory?: string;
  currentStatus: PatientStatus;
  registrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId?: string;
  visitNumber: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: PatientStatus;
  chiefComplaint: string;
  vitals?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  diagnosis?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  medications: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
  }[];
  status: PrescriptionStatus;
  issuedAt: Date;
  dispensedAt?: Date;
  dispensedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabTest {
  id: string;
  visitId: string;
  patientId: string;
  orderedBy: string;
  testName: string;
  testCategory: string;
  status: TestStatus;
  orderedAt: Date;
  sampleCollectedAt?: Date;
  completedAt?: Date;
  reportedAt?: Date;
  performedBy?: string;
  results?: any;
  normalRange?: string;
  isCritical: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}

export interface QueueItem {
  visitId: string;
  patientId: string;
  patientName: string;
  queueNumber: number;
  department: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: PatientStatus;
  estimatedWaitTime?: number;
  joinedAt: Date;
}
