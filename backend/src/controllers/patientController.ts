import { Response } from 'express';
import pool from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, PatientStatus } from '../types';
import { notifyStaff } from '../services/notificationService';
import { addToQueue } from '../services/queueService';

export const registerPatient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      bloodGroup,
      allergies,
      emergencyContact,
      insuranceInfo,
      medicalHistory,
    } = req.body;

    // Generate registration number
    const regNumberResult = await pool.query(
      "SELECT COUNT(*) as count FROM patients WHERE registration_number LIKE 'PAT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%'"
    );
    const count = parseInt(regNumberResult.rows[0].count) + 1;
    const registrationNumber = `PAT-${new Date().getFullYear()}-${String(
      count
    ).padStart(4, '0')}`;

    // Insert patient
    const result = await pool.query(
      `INSERT INTO patients (registration_number, first_name, last_name, date_of_birth, gender, email, phone, address, blood_group, allergies, emergency_contact, insurance_info, medical_history, current_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        registrationNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone,
        address,
        bloodGroup,
        allergies ? JSON.stringify(allergies) : null,
        JSON.stringify(emergencyContact),
        insuranceInfo ? JSON.stringify(insuranceInfo) : null,
        medicalHistory,
        PatientStatus.REGISTERED,
      ]
    );

    const patient = result.rows[0];

    res.status(201).json({
      status: 'success',
      data: { patient },
    });
  }
);

export const checkInPatient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;
    const { chiefComplaint, vitals, department = 'General' } = req.body;

    // Generate visit number
    const visitNumberResult = await pool.query(
      "SELECT COUNT(*) as count FROM visits WHERE visit_number LIKE 'VIS-' || TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') || '-%'"
    );
    const count = parseInt(visitNumberResult.rows[0].count) + 1;
    const visitNumber = `VIS-${new Date()
      .toISOString()
      .split('T')[0]}-${String(count).padStart(4, '0')}`;

    // Create visit
    const visitResult = await pool.query(
      `INSERT INTO visits (patient_id, visit_number, chief_complaint, vitals, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        patientId,
        visitNumber,
        chiefComplaint,
        vitals ? JSON.stringify(vitals) : null,
        PatientStatus.WAITING,
      ]
    );

    const visit = visitResult.rows[0];

    // Update patient status
    await pool.query(
      'UPDATE patients SET current_status = $1 WHERE id = $2',
      [PatientStatus.WAITING, patientId]
    );

    // Get patient details
    const patientResult = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [patientId]
    );
    const patient = patientResult.rows[0];

    // Add to queue
    await addToQueue({
      visitId: visit.id,
      patientId: patient.id,
      patientName: `${patient.first_name} ${patient.last_name}`,
      department,
      status: PatientStatus.WAITING,
    });

    // Notify relevant staff (doctors, nurses in the department)
    await notifyStaff({
      type: 'patient_registered',
      title: 'New Patient Check-in',
      message: `${patient.first_name} ${patient.last_name} (${patient.registration_number}) has checked in`,
      roles: ['doctor', 'nurse'],
      data: {
        patientId: patient.id,
        visitId: visit.id,
        department,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        visit,
        patient,
        message: 'Patient checked in successfully. Staff has been notified.',
      },
    });
  }
);

export const getPatient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      throw new AppError(404, 'Patient not found');
    }

    res.json({
      status: 'success',
      data: { patient: result.rows[0] },
    });
  }
);

export const getPatients = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { search, status, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM patients WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR registration_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND current_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = await pool.query('SELECT COUNT(*) FROM patients');
    const total = parseInt(countQuery.rows[0].count);

    res.json({
      status: 'success',
      data: {
        patients: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

export const getPatientHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Get visits
    const visitsResult = await pool.query(
      `SELECT v.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM visits v
       LEFT JOIN users u ON v.doctor_id = u.id
       WHERE v.patient_id = $1
       ORDER BY v.created_at DESC`,
      [id]
    );

    // Get prescriptions
    const prescriptionsResult = await pool.query(
      `SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM prescriptions p
       LEFT JOIN users u ON p.doctor_id = u.id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );

    // Get lab tests
    const labTestsResult = await pool.query(
      `SELECT l.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM lab_tests l
       LEFT JOIN users u ON l.ordered_by = u.id
       WHERE l.patient_id = $1
       ORDER BY l.created_at DESC`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        visits: visitsResult.rows,
        prescriptions: prescriptionsResult.rows,
        labTests: labTestsResult.rows,
      },
    });
  }
);

export const updatePatient = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = Object.values(updates);

    const result = await pool.query(
      `UPDATE patients SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Patient not found');
    }

    res.json({
      status: 'success',
      data: { patient: result.rows[0] },
    });
  }
);
