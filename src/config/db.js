import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASS, DB_NAME } from './env.js';

// Crear pool de conexiones
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Ejecuta una consulta SQL con parámetros
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise<Array|Object>} Resultados de la consulta
 */
export async function executeQuery(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en executeQuery:', error);
    throw error; // Relanza el error para que lo maneje el llamador
  } finally {
    if (connection) connection.release(); // Libera la conexión al pool
  }
}