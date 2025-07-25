import express from 'express';
import { artistSchema } from '../util/schemaValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  getActors,
  getActorById,
  createActor,
  updateActor,
  deleteActor
} from '../controllers/actorsControllers.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getActors);
router.get('/:id', getActorById);
router.post('/', authenticate, adminOnly, validate(artistSchema), createActor);
router.put('/:id', authenticate, adminOnly, validate(artistSchema), updateActor);
router.delete('/:id', authenticate, adminOnly, deleteActor);

export default router;