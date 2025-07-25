import { executeQuery } from '../config/db.js';
import { verifyAccessToken } from '../util/jwt.js';
import { TokenQueries } from '../util/queries.js';

/**
 * Middleware para verificar el token de acceso
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No autorizado',
        details: 'Token de acceso requerido',
        code: 'MISSING_AUTH_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'No autorizado',
        details: 'Formato de token inválido. Use: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ 
        error: 'Token inválido',
        details: 'El token de acceso es inválido o ha expirado',
        code: 'INVALID_OR_EXPIRED_TOKEN'
      });
    }

    // Verificar que el usuario aún existe
    const user = await executeQuery('SELECT id, es_admin FROM usuarios WHERE id = ?', [decoded.id]);
    if (!user || user.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        details: 'El usuario asociado a este token no existe',
        code: 'USER_NOT_FOUND'
      });
    }

    // Adjuntar información del usuario a la solicitud
    req.user = {
      id: decoded.id,
      role: decoded.role,
      isAdmin: user[0].es_admin
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      error: 'Error de autenticación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'AUTHENTICATION_ERROR'
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Acceso prohibido',
      details: 'Se requieren privilegios de administrador',
      code: 'ADMIN_ACCESS_REQUIRED'
    });
  }
  next();
};