import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError(401, 'Invalid credentials');
  }

  const user = result.rows[0];

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        department: user.department,
      },
      accessToken,
      refreshToken,
    },
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    phone,
    specialization,
    licenseNumber,
    department,
  } = req.body;

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError(400, 'User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name, role, phone, specialization, license_number, department)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, email, first_name, last_name, role, department`,
    [
      email,
      hashedPassword,
      firstName,
      lastName,
      role,
      phone,
      specialization,
      licenseNumber,
      department,
    ]
  );

  const newUser = result.rows[0];

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        department: newUser.department,
      },
    },
  });
});

export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, phone, specialization, license_number, department FROM users WHERE id = $1',
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    const user = result.rows[0];

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          specialization: user.specialization,
          licenseNumber: user.license_number,
          department: user.department,
        },
      },
    });
  }
);
