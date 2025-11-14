import { Response } from 'express';
import pool from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, TestStatus } from '../types';
import { notifyStaff } from '../services/notificationService';

export const getPendingTests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status = 'ordered' } = req.query;

    const result = await pool.query(
      `SELECT l.*, p.first_name, p.last_name, p.registration_number,
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM lab_tests l
       JOIN patients p ON l.patient_id = p.id
       JOIN users u ON l.ordered_by = u.id
       WHERE l.status = $1
       ORDER BY l.ordered_at ASC`,
      [status]
    );

    res.json({
      status: 'success',
      data: { tests: result.rows },
    });
  }
);

export const updateTestStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { testId } = req.params;
    const { status, results, normalRange, isCritical, notes } = req.body;
    const technicianId = req.user?.id;

    let updateFields = 'status = $1, performed_by = $2';
    const params: any[] = [status, technicianId];
    let paramCount = 3;

    if (status === TestStatus.SAMPLE_COLLECTED) {
      updateFields += `, sample_collected_at = CURRENT_TIMESTAMP`;
    } else if (status === TestStatus.COMPLETED) {
      updateFields += `, completed_at = CURRENT_TIMESTAMP`;
    } else if (status === TestStatus.REPORTED) {
      updateFields += `, reported_at = CURRENT_TIMESTAMP`;
    }

    if (results !== undefined) {
      updateFields += `, results = $${paramCount}`;
      params.push(JSON.stringify(results));
      paramCount++;
    }

    if (normalRange !== undefined) {
      updateFields += `, normal_range = $${paramCount}`;
      params.push(normalRange);
      paramCount++;
    }

    if (isCritical !== undefined) {
      updateFields += `, is_critical = $${paramCount}`;
      params.push(isCritical);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields += `, notes = $${paramCount}`;
      params.push(notes);
      paramCount++;
    }

    params.push(testId);

    const result = await pool.query(
      `UPDATE lab_tests
       SET ${updateFields}
       WHERE id = $${paramCount}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Test not found');
    }

    const test = result.rows[0];

    // If test is completed or critical, notify doctor
    if (status === TestStatus.REPORTED || isCritical) {
      const visitResult = await pool.query(
        'SELECT doctor_id FROM visits WHERE id = $1',
        [test.visit_id]
      );

      if (visitResult.rows.length > 0 && visitResult.rows[0].doctor_id) {
        await notifyStaff({
          type: isCritical ? 'critical_result' : 'test_result_ready',
          title: isCritical ? 'CRITICAL Lab Result' : 'Lab Result Ready',
          message: `${test.test_name} result is ${
            isCritical ? 'CRITICAL and ' : ''
          }ready for review`,
          roles: [],
          specificUserId: visitResult.rows[0].doctor_id,
          data: {
            testId: test.id,
            visitId: test.visit_id,
            patientId: test.patient_id,
            testName: test.test_name,
            isCritical,
          },
        });
      }
    }

    res.json({
      status: 'success',
      data: { test },
    });
  }
);

export const getTestDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { testId } = req.params;

    const result = await pool.query(
      `SELECT l.*, p.first_name, p.last_name, p.registration_number,
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM lab_tests l
       JOIN patients p ON l.patient_id = p.id
       JOIN users u ON l.ordered_by = u.id
       WHERE l.id = $1`,
      [testId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Test not found');
    }

    res.json({
      status: 'success',
      data: { test: result.rows[0] },
    });
  }
);

export const getPatientTests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { patientId } = req.params;

    const result = await pool.query(
      `SELECT l.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM lab_tests l
       JOIN users u ON l.ordered_by = u.id
       WHERE l.patient_id = $1
       ORDER BY l.ordered_at DESC`,
      [patientId]
    );

    res.json({
      status: 'success',
      data: { tests: result.rows },
    });
  }
);
