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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
    validUntil: string;
  };
  medicalHistory?: string;
  currentStatus: PatientStatus;
  registrationNumber: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId?: string;
  visitNumber: string;
  checkInTime: string;
  checkOutTime?: string;
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
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  status: PrescriptionStatus;
  issuedAt: string;
  dispensedAt?: string;
  dispensedBy?: string;
  notes?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

export interface Medication {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface LabTest {
  id: string;
  visitId: string;
  patientId: string;
  orderedBy: string;
  testName: string;
  testCategory: string;
  status: TestStatus;
  orderedAt: string;
  sampleCollectedAt?: string;
  completedAt?: string;
  reportedAt?: string;
  performedBy?: string;
  results?: any;
  normalRange?: string;
  isCritical: boolean;
  notes?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  todayPatients: number;
  waitingPatients: number;
  consultationPatients: number;
  pendingLabTests: number;
  pendingPrescriptions: number;
  avgWaitTime: string;
  todayRevenue: number;
}

export interface Bill {
  id: string;
  visitId: string;
  patientId: string;
  totalAmount: number;
  discount: number;
  insuranceCoverage: number;
  paidAmount: number;
  balance: number;
  status: string;
  paymentMethod?: string;
  items: BillItem[];
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
  createdAt: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  itemType: string;
  category?: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  unitPrice: number;
  expiryDate?: string;
  supplier?: string;
  location?: string;
}
