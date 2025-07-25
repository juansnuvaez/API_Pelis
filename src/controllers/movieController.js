import {
  MovieQueries,
  ContentQueries,
  ArtistQueries,
  GenreQueries
} from '../util/queries.js';
import { executeQuery } from '../config/db.js';
import { NODE_ENV } from '../config/env.js'
import { v4 as uuidv4 } from 'uuid';

/**
 * Obtiene todas las películas
 */
export const getMovies = async (req, res) => {
  try {
    const movies = await executeQuery(MovieQueries.getAll);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ 
      error: 'Error al obtener las películas',
      details: NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene una película por su ID
 */
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await executeQuery(MovieQueries.getById, [id]);

    if (!movie || movie.length === 0) {
      return res.status(404).json({ 
        error: 'Película no encontrada',
        details: `No se encontró película con ID: ${id}`
      });
    }

    // Obtener géneros de la película
    const genres = await executeQuery(ContentQueries.getGenres, [movie[0].contenido_id]);
    movie[0].generos = genres;

    res.json(movie[0]);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    res.status(500).json({ 
      error: 'Error al obtener la película',
      details: NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crea una nueva película con manejo robusto de errores
 */
export const createMovie = async (req, res) => {
  try {
    // Verificar que el usuario es admin (doble validación)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        details: 'Se requieren privilegios de administrador',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    const { titulo, descripcion, fecha_lanzamiento, duracion_min, clasificacion, generos, director_id, URLposter } = req.body;

    // Validaciones básicas
    if (!titulo || !descripcion || !fecha_lanzamiento || !duracion_min || !clasificacion || !URLposter) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        details: 'Todos los campos básicos son requeridos (titulo, descripcion, fecha_lanzamiento, duracion_min, clasificacion, URLposter)'
      });
    }

    if (!generos || generos.length === 0) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: 'Debe proporcionar al menos un género'
      });
    }

    // Validar director si se proporciona
    if (director_id) {
      try {
        const director = await executeQuery(ArtistQueries.getById, [director_id]);
        if (!director || director.length === 0) {
          return res.status(400).json({ 
            error: 'Datos inválidos',
            details: 'El director especificado no existe'
          });
        }
      } catch (error) {
        console.error('Error al validar director:', error);
        return res.status(500).json({ 
          error: 'Error al validar director',
          details: NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Validar géneros
    try {
      for (const generoId of generos) {
        const genero = await executeQuery(GenreQueries.getById, [generoId]);
        if (!genero || genero.length === 0) {
          return res.status(400).json({ 
            error: 'Datos inválidos',
            details: `El género con ID ${generoId} no existe`
          });
        }
      }
    } catch (error) {
      console.error('Error al validar géneros:', error);
      return res.status(500).json({ 
        error: 'Error al validar géneros',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Generar IDs
    const contenidoId = uuidv4();
    const peliculaId = uuidv4();

    // Crear el contenido
    try {
      await executeQuery(ContentQueries.create, [
        contenidoId,
        titulo,
        descripcion,
        new Date(fecha_lanzamiento),
        duracion_min,
        clasificacion,
        URLposter
      ]);
    } catch (error) {
      console.error('Error al crear contenido:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          error: 'Error al crear película',
          details: 'Ya existe un contenido con estos datos'
        });
      }
      throw error;
    }

    // Crear la película
    try {
      await executeQuery(MovieQueries.create, [
        peliculaId,
        contenidoId, 
        director_id || null
      ]);
    } catch (error) {
      console.error('Error al crear película:', error);
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: 'Error al crear película',
          details: 'El director especificado no existe'
        });
      }
      
      await executeQuery(ContentQueries.delete, [contenidoId]);
      throw error;
    }

    // Añadir géneros
    try {
      for (const generoId of generos) {
        const generoRelId = uuidv4();
        await executeQuery(ContentQueries.addGenre, [generoRelId, contenidoId, generoId]);
      }
    } catch (error) {
      console.error('Error al añadir géneros:', error);
      await executeQuery(MovieQueries.delete, [peliculaId]);
      await executeQuery(ContentQueries.delete, [contenidoId]);
      
      return res.status(500).json({ 
        error: 'Error al añadir géneros',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Obtener y devolver la película creada
    try {
      const newMovie = await executeQuery(MovieQueries.getById, [peliculaId]);
      res.status(201).json({
        ...newMovie[0],
        creadoPor: req.user.id
      });
    } catch (error) {
      console.error('Error al obtener película recién creada:', error);
      res.status(201).json({ 
        id: peliculaId,
        message: 'Película creada exitosamente',
        creador: req.user.id
      });
    }

  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ 
      error: 'Error al crear la película',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'MOVIE_CREATION_ERROR'
    });
  }
};

/**
 * Actualiza una película existente con manejo robusto de errores
 */
export const updateMovie = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        details: 'Se requieren privilegios de administrador',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    const { id } = req.params;
    const { titulo, descripcion, fecha_lanzamiento, duracion_min, clasificacion, generos, director_id, URLposter } = req.body;

    // Verificar que la película existe
    const movie = await executeQuery(MovieQueries.getById, [id]);
    if (!movie || movie.length === 0) {
      return res.status(404).json({ 
        error: 'Película no encontrada',
        details: `No se encontró película con ID: ${id}`
      });
    }

    const contenidoId = movie[0].contenido_id;

    // Validar director si se proporciona
    if (director_id !== undefined && director_id !== null) {
      try {
        const director = await executeQuery(ArtistQueries.getById, [director_id]);
        if (!director || director.length === 0) {
          return res.status(400).json({ 
            error: 'Datos inválidos',
            details: 'El director especificado no existe'
          });
        }
      } catch (error) {
        console.error('Error al validar director:', error);
        return res.status(500).json({ 
          error: 'Error al validar director',
          details: NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Actualizar el contenido
    try {
      await executeQuery(ContentQueries.update, [
        titulo || null,
        descripcion || null,
        fecha_lanzamiento ? new Date(fecha_lanzamiento) : null,
        duracion_min || null,
        clasificacion || null,
        URLposter || null,
        contenidoId
      ]);
    } catch (error) {
      console.error('Error al actualizar contenido:', error);
      return res.status(500).json({ 
        error: 'Error al actualizar información básica',
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Actualizar director si se proporciona
    if (director_id !== undefined) {
      try {
        await executeQuery(MovieQueries.update, [director_id || null, id]);
      } catch (error) {
        console.error('Error al actualizar director:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ 
            error: 'Error al actualizar director',
            details: 'El director especificado no existe'
          });
        }
        return res.status(500).json({ 
          error: 'Error al actualizar director',
          details: NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Actualizar géneros si se proporcionan
    if (generos) {
      try {
        // Validar nuevos géneros
        for (const generoId of generos) {
          const genero = await executeQuery(GenreQueries.getById, [generoId]);
          if (!genero || genero.length === 0) {
            return res.status(400).json({ 
              error: 'Datos inválidos',
              details: `El género con ID ${generoId} no existe`
            });
          }
        }

        // Eliminar géneros actuales
        const currentGenres = await executeQuery(ContentQueries.getGenres, [contenidoId]);
        for (const genre of currentGenres) {
          await executeQuery(ContentQueries.removeGenre, [contenidoId, genre.id]);
        }

        // Añadir nuevos géneros
        for (const generoId of generos) {
          const generoRelId = uuidv4();
          await executeQuery(ContentQueries.addGenre, [generoRelId, contenidoId, generoId]);
        }
      } catch (error) {
        console.error('Error al actualizar géneros:', error);
        return res.status(500).json({ 
          error: 'Error al actualizar géneros',
          details: NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Registrar la actualización
    console.log(`Película ${id} actualizada por usuario ${req.user.id}`);

    // Obtener y devolver la película actualizada
    try {
      const updatedMovie = await executeQuery(MovieQueries.getById, [id]);
      res.json({
        ...updatedMovie[0],
        actualizadoPor: req.user.id
      });
    } catch (error) {
      console.error('Error al obtener película actualizada:', error);
      res.json({ 
        id: id,
        message: 'Película actualizada exitosamente',
        editor: req.user.id
      });
    }

  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la película',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'MOVIE_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina una película con manejo de errores
 */
export const deleteMovie = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        details: 'Se requieren privilegios de administrador',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    const { id } = req.params;

    // Verificar que la película existe
    const movie = await executeQuery(MovieQueries.getById, [id]);
    if (!movie || movie.length === 0) {
      return res.status(404).json({ 
        error: 'Película no encontrada',
        details: `No se encontró película con ID: ${id}`
      });
    }

    // Registrar la eliminación
    console.log(`Película ${id} eliminada por usuario ${req.user.id}`);

    // Eliminar la película
    await executeQuery(MovieQueries.delete, [id]);

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting movie:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'No se puede eliminar la película',
        details: 'La película está siendo referenciada por otros registros'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al eliminar la película',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'MOVIE_DELETION_ERROR'
    });
  }
};

/**
 * Obtiene los actores de una película
 */
export const getMovieActors = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movie = await executeQuery(MovieQueries.getById, [id]);
    if (!movie || movie.length === 0) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const actors = await executeQuery(MovieQueries.getActorsByMovie, [id]);
    res.json(actors);
  } catch (error) {
    console.error('Error fetching movie actors:', error);
    res.status(500).json({ 
      error: 'Error al obtener los actores',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const addMovieActor = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        details: 'Se requieren privilegios de administrador',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    const { id } = req.params;
    const { actor_id } = req.body;

    const movie = await executeQuery(MovieQueries.getById, [id]);
    if (!movie || movie.length === 0) {
      return res.status(404).json({ 
        error: 'Película no encontrada',
        details: `No se encontró película con ID: ${id}`
      });
    }

    const actor = await executeQuery(ArtistQueries.getById, [actor_id]);
    if (!actor || actor.length === 0) {
      return res.status(404).json({ 
        error: 'Actor no encontrado',
        details: `No se encontró actor con ID: ${actor_id}`
      });
    }

    await executeQuery(MovieQueries.addActorToMovie, [id, actor_id]);
    res.status(201).json({ 
      message: 'Actor añadido correctamente',
      agregadoPor: req.user.id, // Nuevo: información del usuario
      peliculaId: id,
      actorId: actor_id
    });
  } catch (error) {
    console.error('Error adding actor to movie:', error);
    res.status(500).json({ 
      error: 'Error al añadir actor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'ACTOR_ADDITION_ERROR'
    });
  }
};