import { UserQueries, TokenQueries } from '../util/queries.js';
import { executeQuery } from '../config/db.js';
import { hashPassword, comparePassword } from '../util/password.js';
import { 
  signAccessToken, 
  signRefreshToken, 
  verifyRefreshToken 
} from '../util/jwt.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  NODE_ENV 
} from '../config/env.js';

/**
 * Guarda un refresh token en la base de datos
 */
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(REFRESH_TOKEN_EXPIRES_IN));

    // Verificar que tenemos todos los datos necesarios
    if (!userId || !refreshToken) {
      throw new Error('Faltan datos requeridos para guardar el refresh token');
    }

    // Ejecutar la consulta y capturar el resultado
    const result = await executeQuery(TokenQueries.insertRefreshToken, [
      userId,
      refreshToken,
      expiresAt
    ]);

    // Verificar que se insertó correctamente
    if (!result || result.affectedRows === 0) {
      throw new Error('No se pudo insertar el refresh token en la base de datos');
    }

    console.log(`Refresh token guardado para usuario ${userId}`);

    // Limpiar tokens expirados
    await executeQuery(TokenQueries.deleteExpiredTokens);
    
    return true;
  } catch (error) {
    console.error('Error al guardar refresh token:', error);
    throw new Error(`Error al guardar token de refresco: ${error.message}`);
  }
};

/**
 * Registra un nuevo usuario con manejo robusto de errores
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, nombre, apellido, es_admin } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        details: 'Todos los campos básicos son requeridos (username, email, password)'
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await executeQuery(UserQueries.getUserByEmail, [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ 
        error: 'El email ya está registrado',
        details: `El email ${email} ya está en uso`
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await executeQuery(UserQueries.getUserByUsername, [username]);
    if (existingUsername.length > 0) {
      return res.status(409).json({ 
        error: 'El nombre de usuario ya está en uso',
        details: `El nombre de usuario ${username} no está disponible`
      });
    }

    // Lógica para es_admin: solo permitir si no hay ningún admin
    let isAdmin = 0;
    if (es_admin) {
      const admins = await executeQuery('SELECT COUNT(*) as total FROM usuarios WHERE es_admin = 1');
      if (admins[0].total === 0) {
        isAdmin = 1;
      } else {
        isAdmin = 0;
      }
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Generar ID de usuario
    const userId = uuidv4();

    // Crear el usuario
    await executeQuery(UserQueries.createUser, [
      userId,
      username,
      email,
      passwordHash,
      nombre || null,
      apellido || null,
      isAdmin,
    ]);

    // Generar tokens
    const accessToken = signAccessToken({ 
      id: userId, 
      role: isAdmin ? 'admin' : 'user'
    });
    
    const refreshToken = signRefreshToken({ 
      id: userId, 
      role: isAdmin ? 'admin' : 'user'
    });

    // Guardar refresh token en la base de datos
    await saveRefreshToken(userId, refreshToken);

    // Obtener el usuario recién creado
    const newUser = await executeQuery(UserQueries.getUserById, [userId]);

    // Notificación y redirección a login
    res.status(201).json({
      message: 'Usuario registrado exitosamente. Inicie sesión para continuar.',
      notify: true,
      redirect: '/login',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        nombre: newUser[0].nombre,
        apellido: newUser[0].apellido,
        es_admin: !!isAdmin
      }
    });

  } catch (error) {
    console.error('Error registrando usuario:', error);
    const details = NODE_ENV === 'development' ? error.message : undefined;
    
    if (error.message.includes('token de refresco')) {
      return res.status(500).json({ 
        error: 'Error al guardar token de autenticación',
        details
      });
    }
    
    res.status(500).json({ 
      error: 'Error al registrar el usuario',
      details
    });
  }
};

/**
 * Inicia sesión de un usuario con manejo robusto de errores
 */
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Buscar usuario
    let user = await executeQuery(UserQueries.getUserByEmail, [usernameOrEmail]);
    if (user.length === 0) {
      user = await executeQuery(UserQueries.getUserByUsername, [usernameOrEmail]);
      if (user.length === 0) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas',
          details: 'Usuario no encontrado'
        });
      }
    }

    // Verificar contraseña
    const passwordMatch = await comparePassword(password, user[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        details: 'Contraseña incorrecta'
      });
    }

    // Verificar cuenta activa
    if (!user[0].activo) {
      return res.status(403).json({ 
        error: 'Cuenta desactivada',
        details: 'La cuenta está desactivada'
      });
    }

    // Actualizar último login
    try {
      await executeQuery(UserQueries.updateLastLogin, [user[0].id]);
    } catch (error) {
      console.error('Error actualizando último login:', error);
    }

    // Generar tokens
    const accessToken = signAccessToken({ 
      id: user[0].id, 
      role: user[0].es_admin ? 'admin' : 'user' 
    });
    
    const refreshToken = signRefreshToken({ 
      id: user[0].id, 
      role: user[0].es_admin ? 'admin' : 'user' 
    });

    // Guardar refresh token en la base de datos
    await saveRefreshToken(user[0].id, refreshToken);

    res.json({
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      nombre: user[0].nombre,
      apellido: user[0].apellido,
      es_admin: user[0].es_admin,
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Error en login:', error);
    const details = NODE_ENV === 'development' ? error.message : undefined;
    
    if (error.message.includes('token de refresco')) {
      return res.status(500).json({ 
        error: 'Error al guardar token de autenticación',
        details
      });
    }
    
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details
    });
  }
};

/**
 * Refresca un token de acceso con manejo robusto de errores
 */
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token de refresco requerido',
        details: 'Se requiere un token de refresco válido'
      });
    }

    // Verificar token en la base de datos
    let dbToken;
    try {
      dbToken = await executeQuery(TokenQueries.getRefreshToken, [token]);
      if (dbToken.length === 0) {
        return res.status(403).json({ 
          error: 'Token de refresco inválido',
          details: 'Token no encontrado en la base de datos'
        });
      }
    } catch (error) {
      console.error('Error al verificar token en BD:', error);
      return res.status(500).json({ 
        error: 'Error al verificar token',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Verificar token JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
      if (!decoded) {
        // Eliminar token inválido de la base de datos
        await executeQuery(TokenQueries.deleteRefreshToken, [token]);
        return res.status(403).json({ 
          error: 'Token de refresco inválido',
          details: 'Token JWT no válido'
        });
      }
    } catch (error) {
      console.error('Error al verificar token JWT:', error);
      
      if (error.name === 'TokenExpiredError') {
        // Eliminar token expirado de la base de datos
        await executeQuery(TokenQueries.deleteRefreshToken, [token]);
        return res.status(403).json({ 
          error: 'Token de refresco expirado',
          details: 'El token de refresco ha expirado'
        });
      }
      
      return res.status(403).json({ 
        error: 'Token de refresco inválido',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Obtener información del usuario
    let user;
    try {
      user = await executeQuery(UserQueries.getUserById, [decoded.id]);
      if (user.length === 0) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado',
          details: 'El usuario asociado al token no existe'
        });
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return res.status(500).json({ 
        error: 'Error al obtener información del usuario',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Generar nuevo access token
    let newAccessToken;
    try {
      newAccessToken = signAccessToken({ 
        id: user[0].id, 
        role: user[0].es_admin ? 'admin' : 'user' 
      });
    } catch (error) {
      console.error('Error al generar nuevo token:', error);
      return res.status(500).json({ 
        error: 'Error al generar nuevo token de acceso',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Error inesperado refrescando token:', error);
    res.status(500).json({ 
      error: 'Error inesperado al refrescar el token',
      details: NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cierra la sesión de un usuario (revoca el refresh token) con manejo robusto de errores
 */
export const logout = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token de refresco requerido',
        details: 'Se requiere un token de refresco válido'
      });
    }

    // Eliminar token de la base de datos
    try {
      await executeQuery(TokenQueries.deleteRefreshToken, [token]);
      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar token:', error);
      res.status(500).json({ 
        error: 'Error al cerrar sesión',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Error inesperado en logout:', error);
    res.status(500).json({ 
      error: 'Error inesperado al cerrar sesión',
      details: NODE_ENV === 'development' ? error.message : undefined
    });
  }
};