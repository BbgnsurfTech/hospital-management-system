import { Response } from 'express';
import pool from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, PrescriptionStatus } from '../types';
import { notifyStaff } from '../services/notificationService';

export const getPendingPrescriptions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status = 'pending' } = req.query;

    const result = await pool.query(
      `SELECT pr.*, p.first_name, p.last_name, p.registration_number,
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM prescriptions pr
       JOIN patients p ON pr.patient_id = p.id
       JOIN users u ON pr.doctor_id = u.id
       WHERE pr.status = $1
       ORDER BY pr.issued_at ASC`,
      [status]
    );

    res.json({
      status: 'success',
      data: { prescriptions: result.rows },
    });
  }
);

export const dispenseMedication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { prescriptionId } = req.params;
    const { dispensedItems, status = PrescriptionStatus.DISPENSED } = req.body;
    const pharmacistId = req.user?.id;

    // Update prescription
    const result = await pool.query(
      `UPDATE prescriptions
       SET status = $1, dispensed_at = CURRENT_TIMESTAMP, dispensed_by = $2
       WHERE id = $3
       RETURNING *`,
      [status, pharmacistId, prescriptionId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Prescription not found');
    }

    const prescription = result.rows[0];

    // Update inventory (deduct quantities)
    if (dispensedItems && Array.isArray(dispensedItems)) {
      for (const item of dispensedItems) {
        await pool.query(
          'UPDATE inventory SET quantity = quantity - $1 WHERE item_name = $2',
          [item.quantity, item.medicationName]
        );
      }
    }

    // Notify billing department
    await notifyStaff({
      type: 'medication_ready',
      title: 'Medication Dispensed',
      message: `Prescription ${prescriptionId} has been dispensed`,
      roles: ['billing'],
      data: {
        prescriptionId,
        patientId: prescription.patient_id,
        visitId: prescription.visit_id,
      },
    });

    res.json({
      status: 'success',
      data: { prescription },
    });
  }
);

export const getPrescriptionDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { prescriptionId } = req.params;

    const result = await pool.query(
      `SELECT pr.*, p.first_name, p.last_name, p.registration_number,
              u.first_name as doctor_first_name, u.last_name as doctor_last_name
       FROM prescriptions pr
       JOIN patients p ON pr.patient_id = p.id
       JOIN users u ON pr.doctor_id = u.id
       WHERE pr.id = $1`,
      [prescriptionId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Prescription not found');
    }

    res.json({
      status: 'success',
      data: { prescription: result.rows[0] },
    });
  }
);

export const getInventory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { itemType, lowStock } = req.query;

    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (itemType) {
      query += ` AND item_type = $${paramCount}`;
      params.push(itemType);
      paramCount++;
    }

    if (lowStock === 'true') {
      query += ' AND quantity <= reorder_level';
    }

    query += ' ORDER BY item_name ASC';

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: { inventory: result.rows },
    });
  }
);

export const updateInventory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const { quantity, unitPrice, expiryDate, supplier } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount}`);
      params.push(quantity);
      paramCount++;
    }

    if (unitPrice !== undefined) {
      updates.push(`unit_price = $${paramCount}`);
      params.push(unitPrice);
      paramCount++;
    }

    if (expiryDate !== undefined) {
      updates.push(`expiry_date = $${paramCount}`);
      params.push(expiryDate);
      paramCount++;
    }

    if (supplier !== undefined) {
      updates.push(`supplier = $${paramCount}`);
      params.push(supplier);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new AppError(400, 'No update fields provided');
    }

    params.push(itemId);

    const result = await pool.query(
      `UPDATE inventory SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Inventory item not found');
    }

    res.json({
      status: 'success',
      data: { item: result.rows[0] },
    });
  }
);
