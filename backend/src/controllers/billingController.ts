import { Response } from 'express';
import pool from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const createBill = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId, items, discount = 0, insuranceCoverage = 0 } = req.body;

    // Get visit details
    const visitResult = await pool.query(
      'SELECT patient_id FROM visits WHERE id = $1',
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      throw new AppError(404, 'Visit not found');
    }

    const { patient_id } = visitResult.rows[0];

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );
    const balance = totalAmount - discount - insuranceCoverage;

    // Create bill
    const result = await pool.query(
      `INSERT INTO billing (visit_id, patient_id, total_amount, discount, insurance_coverage, balance, items, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [
        visitId,
        patient_id,
        totalAmount,
        discount,
        insuranceCoverage,
        balance,
        JSON.stringify(items),
      ]
    );

    res.status(201).json({
      status: 'success',
      data: { bill: result.rows[0] },
    });
  }
);

export const processPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { billId } = req.params;
    const { paidAmount, paymentMethod } = req.body;

    // Get current bill
    const billResult = await pool.query('SELECT * FROM billing WHERE id = $1', [
      billId,
    ]);

    if (billResult.rows.length === 0) {
      throw new AppError(404, 'Bill not found');
    }

    const bill = billResult.rows[0];
    const currentPaidAmount = parseFloat(bill.paid_amount || 0);
    const newPaidAmount = currentPaidAmount + parseFloat(paidAmount);
    const newBalance = parseFloat(bill.total_amount) - newPaidAmount;

    const status = newBalance <= 0 ? 'paid' : 'partially_paid';

    // Update bill
    const result = await pool.query(
      `UPDATE billing
       SET paid_amount = $1, balance = $2, status = $3, payment_method = $4
       WHERE id = $5
       RETURNING *`,
      [newPaidAmount, newBalance, status, paymentMethod, billId]
    );

    res.json({
      status: 'success',
      data: { bill: result.rows[0] },
    });
  }
);

export const getBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { billId } = req.params;

  const result = await pool.query(
    `SELECT b.*, p.first_name, p.last_name, p.registration_number
     FROM billing b
     JOIN patients p ON b.patient_id = p.id
     WHERE b.id = $1`,
    [billId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Bill not found');
  }

  res.json({
    status: 'success',
    data: { bill: result.rows[0] },
  });
});

export const getVisitBill = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { visitId } = req.params;

    const result = await pool.query(
      `SELECT b.*, p.first_name, p.last_name, p.registration_number
       FROM billing b
       JOIN patients p ON b.patient_id = p.id
       WHERE b.visit_id = $1`,
      [visitId]
    );

    res.json({
      status: 'success',
      data: { bill: result.rows.length > 0 ? result.rows[0] : null },
    });
  }
);

export const getPendingBills = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await pool.query(
      `SELECT b.*, p.first_name, p.last_name, p.registration_number
       FROM billing b
       JOIN patients p ON b.patient_id = p.id
       WHERE b.status IN ('pending', 'partially_paid')
       ORDER BY b.created_at DESC`
    );

    res.json({
      status: 'success',
      data: { bills: result.rows },
    });
  }
);
