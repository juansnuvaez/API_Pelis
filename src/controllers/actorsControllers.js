import { ArtistQueries } from "../util/queries.js";
import { executeQuery } from "../config/db.js";
import { NODE_ENV } from "../config/env.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Obtiene todos los actores con paginación
 */
export const getActors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    if (page < 1 || limit < 1) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: 'Los valores de página y límite deben ser mayores a 0',
        code: 'INVALID_PAGINATION_PARAMS'
      });
    }

    const offset = (page - 1) * limit;

    // Query modificada para paginación
    const actors = await executeQuery(
      'SELECT artista_id as id, nombre, apellido, pais_origen, URLavatar FROM artistas ORDER BY apellido, nombre LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    const totalResult = await executeQuery('SELECT COUNT(*) as total FROM artistas');
    const total = totalResult[0].total;

    res.json({
      data: actors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching actors:', error);
    res.status(500).json({ 
      error: 'Error al obtener los actores',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Obtiene las películas por el ID con su actor
 */
export const getActorById = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = await executeQuery(ArtistQueries.getById, [id]);

    if (!actor || actor.length === 0) {
      return res.status(404).json({
        error: "Actor no encontrado",
        details: `No se encontró actor con ID: ${id}`,
        code: "ACTOR_NOT_FOUND",
      });
    }

    // Obtener películas en las que ha participado el actor
    const movies = await executeQuery(ArtistQueries.getByIdMovies, [id]);

    res.json({
      data: {
        ...actor[0],
        peliculas: movies,
      },
    });
  } catch (error) {
    console.error("Error fetching actor by ID:", error);
    res.status(500).json({
      error: "Error al obtener el actor",
      details: NODE_ENV === "development" ? error.message : undefined,
      code: "SERVER_ERROR",
    });
  }
};

/**
 * Crea un nuevo actor con validaciones y respuesta completa
 */
export const createActor = async (req, res) => {
  try {
    const { nombre, apellido, pais_origen, URLavatar } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        details: 'Nombre y apellido son campos requeridos',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (nombre.length > 50 || apellido.length > 50) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: 'Nombre y apellido no pueden exceder los 50 caracteres',
        code: 'INVALID_FIELD_LENGTH'
      });
    }

    // Validación adicional para URLavatar
    if (URLavatar && !isValidUrl(URLavatar)) {
      return res.status(400).json({ 
        error: 'URL inválida',
        details: 'La URL del avatar no es válida',
        code: 'INVALID_URL'
      });
    }

    const actorId = uuidv4();

    // Query modificada para incluir URLavatar
    const createResult = await executeQuery(ArtistQueries.create, [
      actorId,
      nombre,
      apellido,
      pais_origen || null,
      URLavatar || null
    ]);

    if (!createResult || createResult.affectedRows === 0) {
      throw new Error('La creación del actor no tuvo efecto en la base de datos');
    }

    const [newActor] = await executeQuery(ArtistQueries.getIdNew, [actorId]);

    res.status(201).json({
      message: 'Actor creado exitosamente',
      data: newActor
    });

  } catch (error) {
    console.error('Error creating actor:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'Actor ya existe',
        details: 'Ya existe un actor con ese nombre y apellido',
        code: 'DUPLICATE_ACTOR'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear el actor',
      details: NODE_ENV === 'development' ? error.message : undefined,
      code: 'SERVER_ERROR'
    });
  }
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Actualiza un actor existente con validaciones
 */
export const updateActor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, pais_origen, URLavatar } = req.body;

    // Verificar que el actor existe
    const actor = await executeQuery(ArtistQueries.getById, [id]);
    if (!actor || actor.length === 0) {
      return res.status(404).json({
        error: "Actor no encontrado",
        details: `No se encontró actor con ID: ${id}`,
        code: "ACTOR_NOT_FOUND",
      });
    }

    // Validar longitud máxima si se proporcionan nuevos valores
    if ((nombre && nombre.length > 50) || (apellido && apellido.length > 50)) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: "Nombre y apellido no pueden exceder los 50 caracteres",
        code: "INVALID_FIELD_LENGTH",
      });
    }

    // Actualizar el actor
    await executeQuery(ArtistQueries.update, [
      nombre || actor[0].nombre,
      apellido || actor[0].apellido,
      pais_origen || actor[0].pais_origen,
      URLavatar !== undefined ? URLavatar : null,
      id,
    ]);

    // Obtener el actor actualizado
    const updatedActor = await executeQuery(ArtistQueries.getById, [id]);

    res.json({
      message: "Actor actualizado exitosamente",
      data: updatedActor[0],
    });
  } catch (error) {
    console.error("Error updating actor:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Actor ya existe",
        details: "Ya existe un actor con ese nombre y apellido",
        code: "DUPLICATE_ACTOR",
      });
    }

    res.status(500).json({
      error: "Error al actualizar el actor",
      details: NODE_ENV === "development" ? error.message : undefined,
      code: "SERVER_ERROR",
    });
  }
};

/**
 * Elimina un actor con validaciones
 */
export const deleteActor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el actor existe
    const actor = await executeQuery(ArtistQueries.getById, [id]);
    if (!actor || actor.length === 0) {
      return res.status(404).json({
        error: "Actor no encontrado",
        details: `No se encontró actor con ID: ${id}`,
        code: "ACTOR_NOT_FOUND",
      });
    }

    // Verificar si el actor está asociado a películas
    const moviesCount = await executeQuery(
      "SELECT COUNT(*) as count FROM peliculas_actores WHERE artista_id = ?",
      [id]
    );

    if (moviesCount[0].count > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el actor",
        details: "El actor está asociado a películas y no puede ser eliminado",
        code: "ACTOR_HAS_MOVIES",
      });
    }

    // Eliminar el actor
    await executeQuery(ArtistQueries.delete, [id]);

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting actor:", error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "No se puede eliminar el actor",
        details: "El actor está asociado a películas y no puede ser eliminado",
        code: "ACTOR_HAS_MOVIES",
      });
    }

    res.status(500).json({
      error: "Error al eliminar el actor",
      details: NODE_ENV === "development" ? error.message : undefined,
      code: "SERVER_ERROR",
    });
  }
};
