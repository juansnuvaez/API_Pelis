import { GenreQueries } from '../util/queries.js';
import { executeQuery } from '../config/db.js';
import { NODE_ENV } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obtiene todos los géneros
 */
export const getGenres = async (req, res) => {
  try {
    const genres = await executeQuery(GenreQueries.getAll);
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ 
      error: 'Error al obtener los géneros',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'GENRES_FETCH_ERROR'
    });
  }
};

/**
 * Obtiene un género por su ID
 */
export const getGenreById = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await executeQuery(GenreQueries.getById, [id]);

    if (!genre || genre.length === 0) {
      return res.status(404).json({ 
        error: 'Género no encontrado',
        details: `No se encontró género con ID: ${id}`,
        code: 'GENRE_NOT_FOUND'
      });
    }

    res.json(genre[0]);
  } catch (error) {
    console.error('Error fetching genre by ID:', error);
    res.status(500).json({ 
      error: 'Error al obtener el género',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'GENRE_FETCH_ERROR'
    });
  }
};

/**
 * Crea un nuevo género
 */
export const createGenre = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Verificar si el género ya existe
    const genreExists = await executeQuery(GenreQueries.existsByName, [nombre]);
    if (genreExists.length > 0) {
      return res.status(409).json({ 
        error: 'El género ya existe',
        details: `Ya existe un género con el nombre: ${nombre}`,
        code: 'GENRE_ALREADY_EXISTS'
      });
    }

    // Generar ID para el nuevo género
    const genero_id = uuidv4();

    // Crear el género con todos los parámetros requeridos
    await executeQuery(GenreQueries.create, [
      genero_id,      // Primer parámetro: genero_id
      nombre,         // Segundo parámetro: nombre
      descripcion || null  // Tercer parámetro: descripcion (o null si no viene)
    ]);

    // Obtener el género recién creado usando el ID generado
    const newGenre = await executeQuery(GenreQueries.getById, [genero_id]);

    // Registrar quién creó el género (opcional)
    console.log(`Género creado por el usuario: ${req.user.id}`);

    res.status(201).json(newGenre[0]);
  } catch (error) {
    console.error('Error creating genre:', error);
    
    // Manejo de errores específicos mejorado
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ 
        error: 'Error de formato de datos',
        details: 'Algunos datos tienen un formato incorrecto',
        code: 'INVALID_DATA_FORMAT'
      });
    }

    if (error.code === 'ER_WRONG_ARGUMENTS') {
      return res.status(400).json({ 
        error: 'Error en los parámetros',
        details: 'Los datos proporcionados son incorrectos o están incompletos',
        code: 'INVALID_PARAMETERS'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear el género',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'GENRE_CREATION_ERROR'
    });
  }
};

/**
 * Actualiza un género existente
 */
export const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar que el género existe
    const genre = await executeQuery(GenreQueries.getById, [id]);
    if (!genre || genre.length === 0) {
      return res.status(404).json({ 
        error: 'Género no encontrado',
        details: `No se encontró género con ID: ${id}`,
        code: 'GENRE_NOT_FOUND'
      });
    }

    // Validaciones básicas
    if (!nombre && !descripcion) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        details: 'Debe proporcionar al menos un campo para actualizar',
        code: 'MISSING_UPDATE_FIELDS'
      });
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (nombre && nombre !== genre[0].nombre) {
      const genreExists = await executeQuery(GenreQueries.existsByName, [nombre]);
      if (genreExists.length > 0) {
        return res.status(409).json({ 
          error: 'Ya existe un género con ese nombre',
          details: `El nombre '${nombre}' ya está en uso`,
          code: 'GENRE_NAME_CONFLICT'
        });
      }
    }

    // Actualizar el género
    await executeQuery(GenreQueries.update, [
      nombre || genre[0].nombre,
      descripcion || genre[0].descripcion,
      id
    ]);

    // Obtener el género actualizado
    const updatedGenre = await executeQuery(GenreQueries.getById, [id]);

    // Registrar quién actualizó el género (opcional)
    console.log(`Género actualizado por el usuario: ${req.user.id}`);

    res.json(updatedGenre[0]);
  } catch (error) {
    console.error('Error updating genre:', error);
    
    // Manejo de errores específicos
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return res.status(400).json({ 
        error: 'Error de formato de datos',
        details: 'Algunos datos tienen un formato incorrecto',
        code: 'INVALID_DATA_FORMAT'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar el género',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'GENRE_UPDATE_ERROR'
    });
  }
};

/**
 * Elimina un género
 */
export const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el género existe
    const genre = await executeQuery(GenreQueries.getById, [id]);
    if (!genre || genre.length === 0) {
      return res.status(404).json({ 
        error: 'Género no encontrado',
        details: `No se encontró género con ID: ${id}`,
        code: 'GENRE_NOT_FOUND'
      });
    }

    // Eliminar el género
    await executeQuery(GenreQueries.delete, [id]);

    // Registrar quién eliminó el género (opcional)
    console.log(`Género eliminado por el usuario: ${req.user.id}`);

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting genre:', error);
    
    // Manejar error de clave foránea (si el género está en uso)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ 
        error: 'No se puede eliminar el género',
        details: 'El género está asociado a contenido y no puede ser eliminado',
        code: 'GENRE_IN_USE'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al eliminar el género',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'GENRE_DELETION_ERROR'
    });
  }
};