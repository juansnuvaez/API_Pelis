import bcrypt from 'bcryptjs';

/* -------------- Config ------------------ */
const SALT_ROUNDS = 10;

/* -------------- API pública ------------- */
export async function hashPassword(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}