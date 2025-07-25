import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
} from '../config/env.js';

console.log('[DEBUG] ACCESS_TOKEN_SECRET:', ACCESS_TOKEN_SECRET ? 'OK' : 'FALTANTE');
console.log('[DEBUG] REFRESH_TOKEN_SECRET:', REFRESH_TOKEN_SECRET ? 'OK' : 'FALTANTE')

const handleJWTError = (error) => {
  if (error instanceof jwt.JsonWebTokenError) {
    throw new Error('Token inválido');
  }
  if (error instanceof jwt.TokenExpiredError) {
    throw new Error('Token expirado');
  }
  throw error;
};

export function signAccessToken({ id, role }) {
  try {
    if (!id || !role) {
      throw new Error('Se requieren id y role para firmar el token');
    }
    
    return jwt.sign(
      { id, role }, 
      ACCESS_TOKEN_SECRET, 
      { 
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    console.error('Error al firmar access token:', error);
    throw error;
  }
}

export function signRefreshToken({ id, role }) {
  try {
    if (!id || !role) {
      throw new Error('Se requieren id y role para firmar el refresh token');
    }
    
    return jwt.sign(
      { id, role }, 
      REFRESH_TOKEN_SECRET, 
      { 
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    console.error('Error al firmar refresh token:', error);
    throw error;
  }
}

export function verifyAccessToken(token) {
  try {
    if (!token) {
      throw new Error('Token no proporcionado');
    }
    return jwt.verify(token, ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    handleJWTError(error);
  }
}

export function verifyRefreshToken(token) {
  try {
    if (!token) {
      throw new Error('Token no proporcionado');
    }
    return jwt.verify(token, REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    handleJWTError(error);
  }
}