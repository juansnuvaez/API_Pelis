import express from 'express';
import { genreSchema } from '../util/schemaValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  getGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre
} from '../controllers/genresControllers.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGenres);
router.get('/:id', getGenreById);
router.post('/', authenticate, adminOnly, validate(genreSchema), createGenre);
router.put('/:id', authenticate, adminOnly, validate(genreSchema), updateGenre);
router.delete('/:id',authenticate, adminOnly, deleteGenre);

export default router;