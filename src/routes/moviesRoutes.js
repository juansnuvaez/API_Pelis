import express from 'express';
import { 
  movieSchema, 
  updateMovieSchema,
  MovieActor
} from '../util/schemaValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieActors,
  addMovieActor
} from '../controllers/movieController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', getMovies);
router.get('/:id', getMovieById);
router.post('/', authenticate, adminOnly, validate(movieSchema), createMovie);
router.put('/:id', authenticate, adminOnly, validate(updateMovieSchema), updateMovie);
router.patch('/:id', authenticate, adminOnly, validate(updateMovieSchema), updateMovie);
router.delete('/:id', authenticate, adminOnly, deleteMovie);

// Rutas para actores de películas
router.get('/:id/actors', getMovieActors);
router.post('/:id/actors', authenticate, adminOnly, validate(MovieActor), addMovieActor);

export default router;