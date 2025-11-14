import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
};
