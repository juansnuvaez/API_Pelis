import express from 'express';
import { registerSchema, loginSchema } from '../util/schemaValidator.js'
import { validate } from '../middleware/validateMiddleware.js';
import {
  register,
  login,
  refreshToken,
} from '../controllers/authControllers.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);       
router.post('/login', validate(loginSchema), login);             
router.post('/refresh', refreshToken);     

export default router;