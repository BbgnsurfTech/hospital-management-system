import { Response } from 'express';
import pool from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, PatientStatus } from '../types';
import { notifyStaff } from '../services/notificationService';
import { updateQueueStatus } from '../services/queueService';

export const getMyPatients = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const doctorId = req.user?.id;
    const { status, date } = req.query;

    let query = `
      SELECT v.*, p.first_name, p.last_name, p.registration_number, p.date_of_birth, p.gender, p.phone, p.allergies
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      WHERE v.doctor_id = $1
    `;
    const params: any[] = [doctorId];
    let paramCount = 2;

    if (status) {
      query += ` AND v.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date) {
      query += ` AND DATE(v.check_in_time) = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    query += ' ORDER BY v.check_in_time DESC';

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: { visits: result.rows },
    });
  }
);

export const startConsultation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId } = req.params;
    const doctorId = req.user?.id;

    // Update visit status
    const result = await pool.query(
      `UPDATE visits
       SET status = $1, doctor_id = $2
       WHERE id = $3
       RETURNING *`,
      [PatientStatus.IN_CONSULTATION, doctorId, visitId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Visit not found');
    }

    const visit = result.rows[0];

    // Update patient status
    await pool.query(
      'UPDATE patients SET current_status = $1 WHERE id = $2',
      [PatientStatus.IN_CONSULTATION, visit.patient_id]
    );

    // Update queue
    const queueResult = await pool.query(
      'SELECT department FROM queue WHERE visit_id = $1',
      [visitId]
    );

    if (queueResult.rows.length > 0) {
      await updateQueueStatus(
        visitId,
        PatientStatus.IN_CONSULTATION,
        queueResult.rows[0].department
      );
    }

    res.json({
      status: 'success',
      data: { visit },
    });
  }
);

export const updateConsultation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId } = req.params;
    const { diagnosis, notes, vitals } = req.body;

    const result = await pool.query(
      `UPDATE visits
       SET diagnosis = $1, notes = $2, vitals = $3
       WHERE id = $4
       RETURNING *`,
      [diagnosis, notes, vitals ? JSON.stringify(vitals) : null, visitId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Visit not found');
    }

    res.json({
      status: 'success',
      data: { visit: result.rows[0] },
    });
  }
);

export const issuePrescription = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId } = req.params;
    const { medications, notes } = req.body;
    const doctorId = req.user?.id;

    // Get visit details
    const visitResult = await pool.query(
      'SELECT patient_id FROM visits WHERE id = $1',
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      throw new AppError(404, 'Visit not found');
    }

    const { patient_id } = visitResult.rows[0];

    // Create prescription
    const result = await pool.query(
      `INSERT INTO prescriptions (visit_id, patient_id, doctor_id, medications, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [visitId, patient_id, doctorId, JSON.stringify(medications), notes]
    );

    const prescription = result.rows[0];

    // Notify pharmacy
    await notifyStaff({
      type: 'prescription_issued',
      title: 'New Prescription',
      message: `New prescription issued for visit ${visitId}`,
      roles: ['pharmacist'],
      data: {
        prescriptionId: prescription.id,
        visitId,
        patientId: patient_id,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { prescription },
    });
  }
);

export const orderLabTests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId } = req.params;
    const { tests } = req.body;
    const doctorId = req.user?.id;

    // Get visit details
    const visitResult = await pool.query(
      'SELECT patient_id FROM visits WHERE id = $1',
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      throw new AppError(404, 'Visit not found');
    }

    const { patient_id } = visitResult.rows[0];

    // Create lab tests
    const createdTests = [];

    for (const test of tests) {
      const result = await pool.query(
        `INSERT INTO lab_tests (visit_id, patient_id, ordered_by, test_name, test_category, status)
         VALUES ($1, $2, $3, $4, $5, 'ordered')
         RETURNING *`,
        [visitId, patient_id, doctorId, test.testName, test.testCategory]
      );

      createdTests.push(result.rows[0]);
    }

    // Update visit status
    await pool.query(
      'UPDATE visits SET status = $1 WHERE id = $2',
      [PatientStatus.AWAITING_TESTS, visitId]
    );

    // Notify lab technicians
    await notifyStaff({
      type: 'test_ordered',
      title: 'New Lab Tests Ordered',
      message: `${tests.length} lab test(s) ordered for visit ${visitId}`,
      roles: ['lab_technician'],
      data: {
        visitId,
        patientId: patient_id,
        testIds: createdTests.map((t) => t.id),
      },
    });

    res.status(201).json({
      status: 'success',
      data: { tests: createdTests },
    });
  }
);

export const completeConsultation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId } = req.params;

    const result = await pool.query(
      `UPDATE visits
       SET status = $1, check_out_time = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [PatientStatus.COMPLETED, visitId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Visit not found');
    }

    const visit = result.rows[0];

    // Update patient status
    await pool.query(
      'UPDATE patients SET current_status = $1 WHERE id = $2',
      [PatientStatus.COMPLETED, visit.patient_id]
    );

    res.json({
      status: 'success',
      data: { visit },
      message: 'Consultation completed successfully',
    });
  }
);
