import dotenv from 'dotenv';
dotenv.config();

export const {
  PORT = 3000,
  DB_HOST = '127.0.0.1',
  DB_PORT = 3306,
  DB_NAME = 'pelis',
  DB_USER = 'root',
  DB_PASS = '',
  ACCESS_TOKEN_SECRET = "",
  REFRESH_TOKEN_SECRET = "", 
  ACCESS_TOKEN_EXPIRES_IN = '15m',
  REFRESH_TOKEN_EXPIRES_IN = '7d',
  NODE_ENV = "development"
} = process.env;

// Validación en desarrollo
if (NODE_ENV === 'development') {
  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.warn('Advertencia: Las claves secretas no están configuradas. Usando valores de desarrollo inseguros.');
    process.env.ACCESS_TOKEN_SECRET = "dev_access_secret_" + Math.random().toString(36).substring(2);
    process.env.REFRESH_TOKEN_SECRET = "dev_refresh_secret_" + Math.random().toString(36).substring(2);
  }
}