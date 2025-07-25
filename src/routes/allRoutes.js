import express from 'express';
import usersRoutes from './usersRoutes.js';
import moviesRoutes from './moviesRoutes.js';
import actorsRoutes from './actorsRoutes.js';
import genresRoutes from './genresRoutes.js';

const router = express.Router();

router.use('/auth', usersRoutes);   
router.use('/movies', moviesRoutes);  
router.use('/genres', genresRoutes);  
router.use('/actors', actorsRoutes);  

export default router;