export const UserQueries = {
  createUser: `
    INSERT INTO usuarios (id, username, email, password_hash, nombre, apellido, es_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  getUserByEmail: `
    SELECT id, username, email, password_hash, nombre, apellido, ultimo_login, activo, es_admin
    FROM usuarios 
    WHERE email = ?
  `,

  getUserByUsername: `
    SELECT id, username, email, password_hash, nombre, apellido, ultimo_login, activo, es_admin
    FROM usuarios 
    WHERE username = ?
  `,

  getUserById: `
    SELECT id, username, email, nombre, apellido, ultimo_login, activo, es_admin
    FROM usuarios 
    WHERE id = ?
  `,

  updateUser: `
    UPDATE usuarios
    SET username = COALESCE(?, username),
        email = COALESCE(?, email),
        nombre = COALESCE(?, nombre),
        apellido = COALESCE(?, apellido),
        activo = COALESCE(?, activo)
    WHERE id = ?
  `,

  updatePassword: `
    UPDATE usuarios
    SET password_hash = ?
    WHERE id = ?
  `,

  updateLastLogin: `
    UPDATE usuarios
    SET ultimo_login = NOW()
    WHERE id = ?
  `
};

export const TokenQueries = {
  insertRefreshToken: `
  INSERT INTO refresh_tokens 
  (user_id, token, expires_at) 
  VALUES (?, ?, ?)
`,

  getRefreshToken: `
    SELECT user_id, token, expires_at, created_at
    FROM refresh_tokens 
    WHERE token = ?
  `,

  deleteRefreshToken: `
    DELETE FROM refresh_tokens 
    WHERE token = ?
  `,

  deleteExpiredTokens: `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
  `,

  revokeToken: `
    UPDATE refresh_tokens 
    SET is_revoked = 1 
    WHERE token = ?
  `,
  revokeAllForUser: `
    UPDATE refresh_tokens 
    SET is_revoked = 1 
    WHERE user_id = ?
  `,
};

export const GenreQueries = {
  getAll: `
    SELECT genero_id as id, nombre, descripcion
    FROM generos
    ORDER BY nombre
  `,

  getById: `
    SELECT genero_id as id, nombre, descripcion
    FROM generos
    WHERE genero_id = ?
  `,

  create: `
    INSERT INTO generos (genero_id, nombre, descripcion)
    VALUES (?, ?, ?)
  `,

  update: `
    UPDATE generos
    SET nombre = ?, descripcion = ?
    WHERE genero_id = ?
  `,

  delete: `
    DELETE FROM generos
    WHERE genero_id = ?
  `,

  existsByName: `
    SELECT 1 FROM generos WHERE nombre = ? LIMIT 1
  `
};

export const ArtistQueries = {
  getAll: `
    SELECT artista_id as id, nombre, apellido, pais_origen, URLavatar
    FROM artistas
    ORDER BY apellido, nombre
  `,
  
  getById: `
    SELECT artista_id as id, nombre, apellido, pais_origen, URLavatar
    FROM artistas
    WHERE artista_id = ?
  `,

  getIdNew: `
      SELECT 
        artista_id as id,
        nombre,
        apellido,
        pais_origen,
        URLavatar
      FROM artistas 
      WHERE artista_id = ?
    `,

  search: `
    SELECT artista_id as id, nombre, apellido, pais_origen, URLavatar
    FROM artistas
    WHERE CONCAT(nombre, ' ', apellido) LIKE CONCAT('%', ?, '%')
    ORDER BY apellido, nombre
    LIMIT ? OFFSET ?
  `,

  create: `
    INSERT INTO artistas (artista_id, nombre, apellido, pais_origen, URLavatar)
    VALUES (?, ?, ?, ?, ?)
  `,

  update: `
    UPDATE artistas
    SET nombre = ?, apellido = ?, pais_origen = ?, URLavatar = COALESCE(?, URLavatar)
    WHERE artista_id = ?
  `,

  delete: `
    DELETE FROM artistas
    WHERE artista_id = ?
  `,
  getByIdMovies:  `
      SELECT 
        p.pelicula_id as id,
        c.titulo,
        c.fecha_lanzamiento
      FROM peliculas_actores pa
      JOIN peliculas p ON pa.pelicula_id = p.pelicula_id
      JOIN contenido c ON p.contenido_id = c.contenido_id
      WHERE pa.artista_id = ?
      ORDER BY c.fecha_lanzamiento DESC
    `
};

export const ContentQueries = {
  getAll: `
    SELECT 
      c.contenido_id as id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion,
      c.URLposter
    FROM contenido c
    ORDER BY c.titulo
  `,

  getById: `
    SELECT 
      c.contenido_id as id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion,
      c.URLposter
    FROM contenido c
    WHERE c.contenido_id = ?
  `,

  getGenres: `
    SELECT 
      g.genero_id as id,
      g.nombre
    FROM contenido_genero cg
    JOIN generos g ON cg.genero_id = g.genero_id
    WHERE cg.contenido_id = ?
  `,

  create: `
    INSERT INTO contenido (
      contenido_id,
      titulo,
      descripcion,
      fecha_lanzamiento,
      duracion_min,
      clasificacion,
      URLposter
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  update: `
    UPDATE contenido
    SET 
      titulo = COALESCE(?, titulo),
      descripcion = COALESCE(?, descripcion),
      fecha_lanzamiento = COALESCE(?, fecha_lanzamiento),
      duracion_min = COALESCE(?, duracion_min),
      clasificacion = COALESCE(?, clasificacion),
      URLposter = COALESCE(?, URLposter)
    WHERE contenido_id = ?
  `,

  delete: `
    DELETE FROM contenido
    WHERE contenido_id = ?
  `,

  addGenre: `
    INSERT INTO contenido_genero (contenido_genero_id, contenido_id, genero_id)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE contenido_id = contenido_id
  `,

  removeGenre: `
    DELETE FROM contenido_genero
    WHERE contenido_id = ? AND genero_id = ?
  `,

  updateRating: `
    UPDATE contenido
    SET promedio_calificacion = (
      SELECT AVG(calificacion)
      FROM calificaciones
      WHERE contenido_id = ?
    )
    WHERE contenido_id = ?
  `
};

export const MovieQueries = {
  getAll: `
    SELECT 
      m.pelicula_id as id,
      m.contenido_id as contenido_id,
      m.director_id as director_id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion,
      c.URLposter,
      a.nombre as director_nombre,
      a.apellido as director_apellido
    FROM peliculas m
    JOIN contenido c ON m.contenido_id = c.contenido_id
    LEFT JOIN artistas a ON m.director_id = a.artista_id
    ORDER BY c.titulo
  `,

  getById: `
    SELECT 
      m.pelicula_id as id,
      m.contenido_id as contenido_id,
      m.director_id as director_id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion,
      c.URLposter,
      a.nombre as director_nombre,
      a.apellido as director_apellido
    FROM peliculas m
    JOIN contenido c ON m.contenido_id = c.contenido_id
    LEFT JOIN artistas a ON m.director_id = a.artista_id
    WHERE m.pelicula_id = ?
  `,

  search: `
    SELECT 
      m.pelicula_id as id,
      m.contenido_id as contenido_id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion,
      c.URLposter
    FROM peliculas m
    JOIN contenido c ON m.contenido_id = c.contenido_id
    WHERE c.titulo LIKE CONCAT('%', ?, '%')
    ORDER BY c.titulo
    LIMIT ? OFFSET ?
  `,

  filter: `
    SELECT 
      m.pelicula_id as id,
      m.contenido_id as contenido_id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion,
      c.URLposter
    FROM peliculas m
    JOIN contenido c ON m.contenido_id = c.contenido_id
    LEFT JOIN contenido_genero cg ON c.contenido_id = cg.contenido_id
    WHERE 
      (? IS NULL OR c.clasificacion = ?) AND
      (? IS NULL OR YEAR(c.fecha_lanzamiento) >= ?) AND
      (? IS NULL OR YEAR(c.fecha_lanzamiento) <= ?) AND
      (? IS NULL OR cg.genero_id = ?) AND
      (? IS NULL OR m.director_id = ?)
    GROUP BY m.pelicula_id
    ORDER BY 
      CASE WHEN ? = 'titulo' AND ? = 'asc' THEN c.titulo END ASC,
      CASE WHEN ? = 'titulo' AND ? = 'desc' THEN c.titulo END DESC,
      CASE WHEN ? = 'fecha_lanzamiento' AND ? = 'asc' THEN c.fecha_lanzamiento END ASC,
      CASE WHEN ? = 'fecha_lanzamiento' AND ? = 'desc' THEN c.fecha_lanzamiento END DESC,
      CASE WHEN ? = 'promedio_calificacion' AND ? = 'asc' THEN c.promedio_calificacion END ASC,
      CASE WHEN ? = 'promedio_calificacion' AND ? = 'desc' THEN c.promedio_calificacion END DESC,
      c.titulo ASC
    LIMIT ? OFFSET ?
  `,

  create: `
    INSERT INTO peliculas (pelicula_id, contenido_id, director_id)
    VALUES (?, ?, ?)
  `,

  update: `
    UPDATE peliculas
    SET director_id = COALESCE(?, director_id)
    WHERE pelicula_id = ?
  `,

  delete: `
    DELETE FROM peliculas
    WHERE pelicula_id = ?
  `,

  getByDirector: `
    SELECT 
      m.pelicula_id as id,
      m.contenido_id as contenido_id,
      c.titulo,
      c.descripcion,
      c.fecha_lanzamiento,
      c.duracion_min,
      c.clasificacion,
      c.promedio_calificacion
    FROM peliculas m
    JOIN contenido c ON m.contenido_id = c.contenido_id
    WHERE m.director_id = ?
    ORDER BY c.fecha_lanzamiento DESC
  `,
  
  getActorsByMovie: `
    SELECT 
      a.artista_id as id,
      a.nombre,
      a.apellido,
      a.pais_origen
    FROM peliculas_actores pa
    JOIN artistas a ON pa.artista_id = a.artista_id
    WHERE pa.pelicula_id = ?
  `,

  addActorToMovie: `
    INSERT INTO peliculas_actores (pelicula_id, artista_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE pelicula_id = pelicula_id
  `,

  removeActorFromMovie: `
    DELETE FROM peliculas_actores
    WHERE pelicula_id = ? AND artista_id = ?
  `

};

export const RatingQueries = {
  create: `
    INSERT INTO calificaciones (usuario_id, contenido_id, calificacion, comentario)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE calificacion = VALUES(calificacion), comentario = VALUES(comentario)
  `,

  getByContent: `
    SELECT 
      r.usuario_id,
      u.username,
      r.calificacion,
      r.comentario,
      r.created_at
    FROM calificaciones r
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.contenido_id = ?
    ORDER BY r.created_at DESC
  `,

  getByUser: `
    SELECT 
      r.contenido_id,
      c.titulo,
      r.calificacion,
      r.comentario,
      r.created_at
    FROM calificaciones r
    JOIN contenido c ON r.contenido_id = c.contenido_id
    WHERE r.usuario_id = ?
    ORDER BY r.created_at DESC
  `,

  getUserRating: `
    SELECT calificacion, comentario
    FROM calificaciones
    WHERE usuario_id = ? AND contenido_id = ?
  `,

  delete: `
    DELETE FROM calificaciones
    WHERE usuario_id = ? AND contenido_id = ?
  `,

  getAverageRating: `
    SELECT AVG(calificacion) as promedio
    FROM calificaciones
    WHERE contenido_id = ?
  `
};