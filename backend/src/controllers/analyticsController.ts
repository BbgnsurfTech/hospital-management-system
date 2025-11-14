import { Response } from 'express';
import pool from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Total patients today
    const todayPatientsResult = await pool.query(
      "SELECT COUNT(*) FROM visits WHERE DATE(check_in_time) = CURRENT_DATE"
    );

    // Patients in waiting
    const waitingPatientsResult = await pool.query(
      "SELECT COUNT(*) FROM visits WHERE status = 'waiting' AND DATE(check_in_time) = CURRENT_DATE"
    );

    // Patients in consultation
    const consultationPatientsResult = await pool.query(
      "SELECT COUNT(*) FROM visits WHERE status = 'in_consultation' AND DATE(check_in_time) = CURRENT_DATE"
    );

    // Pending lab tests
    const pendingLabTestsResult = await pool.query(
      "SELECT COUNT(*) FROM lab_tests WHERE status IN ('ordered', 'sample_collected', 'in_progress')"
    );

    // Pending prescriptions
    const pendingPrescriptionsResult = await pool.query(
      "SELECT COUNT(*) FROM prescriptions WHERE status = 'pending'"
    );

    // Average wait time (in minutes)
    const avgWaitTimeResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (called_at - joined_at))/60) as avg_wait_time
       FROM queue
       WHERE DATE(created_at) = CURRENT_DATE AND called_at IS NOT NULL`
    );

    // Revenue today
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(paid_amount), 0) as revenue FROM billing WHERE DATE(created_at) = CURRENT_DATE"
    );

    res.json({
      status: 'success',
      data: {
        todayPatients: parseInt(todayPatientsResult.rows[0].count),
        waitingPatients: parseInt(waitingPatientsResult.rows[0].count),
        consultationPatients: parseInt(consultationPatientsResult.rows[0].count),
        pendingLabTests: parseInt(pendingLabTestsResult.rows[0].count),
        pendingPrescriptions: parseInt(pendingPrescriptionsResult.rows[0].count),
        avgWaitTime: parseFloat(avgWaitTimeResult.rows[0].avg_wait_time || 0).toFixed(2),
        todayRevenue: parseFloat(revenueResult.rows[0].revenue),
      },
    });
  }
);

export const getPatientFlowAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;

    // Patient flow by status
    const flowResult = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM visits
       WHERE DATE(check_in_time) BETWEEN $1 AND $2
       GROUP BY status`,
      [startDate, endDate]
    );

    // Hourly patient distribution
    const hourlyResult = await pool.query(
      `SELECT EXTRACT(HOUR FROM check_in_time) as hour, COUNT(*) as count
       FROM visits
       WHERE DATE(check_in_time) BETWEEN $1 AND $2
       GROUP BY hour
       ORDER BY hour`,
      [startDate, endDate]
    );

    // Average consultation time
    const avgConsultationResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time))/60) as avg_time
       FROM visits
       WHERE DATE(check_in_time) BETWEEN $1 AND $2
       AND check_out_time IS NOT NULL`,
      [startDate, endDate]
    );

    res.json({
      status: 'success',
      data: {
        patientFlow: flowResult.rows,
        hourlyDistribution: hourlyResult.rows,
        avgConsultationTime: parseFloat(avgConsultationResult.rows[0].avg_time || 0).toFixed(2),
      },
    });
  }
);

export const getDepartmentStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await pool.query(
      `SELECT department, COUNT(*) as patient_count,
              AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time))/60) as avg_time
       FROM visits v
       JOIN queue q ON v.id = q.visit_id
       WHERE DATE(v.check_in_time) = CURRENT_DATE
       GROUP BY department`
    );

    res.json({
      status: 'success',
      data: { departments: result.rows },
    });
  }
);

export const getRevenueAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;

    // Daily revenue
    const dailyRevenueResult = await pool.query(
      `SELECT DATE(created_at) as date, SUM(paid_amount) as revenue
       FROM billing
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [startDate, endDate]
    );

    // Revenue by payment method
    const paymentMethodResult = await pool.query(
      `SELECT payment_method, SUM(paid_amount) as amount
       FROM billing
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY payment_method`,
      [startDate, endDate]
    );

    // Pending payments
    const pendingResult = await pool.query(
      `SELECT SUM(balance) as pending_amount, COUNT(*) as pending_count
       FROM billing
       WHERE status IN ('pending', 'partially_paid')`
    );

    res.json({
      status: 'success',
      data: {
        dailyRevenue: dailyRevenueResult.rows,
        paymentMethods: paymentMethodResult.rows,
        pendingPayments: {
          amount: parseFloat(pendingResult.rows[0].pending_amount || 0),
          count: parseInt(pendingResult.rows[0].pending_count),
        },
      },
    });
  }
);
