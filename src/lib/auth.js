import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';
import { getRequiredSecret } from './security';

const TOKEN_NAME = 'auth_token';

export function createToken(userId) {
  return jwt.sign({ userId }, getRequiredSecret('JWT_SECRET'), {
    expiresIn: '7d',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getRequiredSecret('JWT_SECRET'));
  } catch (error) {
    return null;
  }
}

export function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromRequest(req) {
  const cookies = parse(req.headers.cookie || '');
  return cookies[TOKEN_NAME];
}

export async function getUserFromRequest(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return payload.userId;
}

