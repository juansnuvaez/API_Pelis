-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS pelis;
USE pelis;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    ultimo_login DATETIME,
    activo BOOLEAN DEFAULT TRUE,
    es_admin BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_password_length CHECK (LENGTH(password_hash) > 0)
);

-- Tabla de géneros
CREATE TABLE generos (
    genero_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tabla de actores/directores
CREATE TABLE artistas (
    artista_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    pais_origen VARCHAR(50)
);

-- Tabla de contenido
CREATE TABLE contenido (
    contenido_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_lanzamiento DATE,
    duracion_min INT,
    clasificacion ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'NR') DEFAULT 'NR',
    promedio_calificacion DECIMAL(3,1) DEFAULT 0.0
);

-- Tabla de relación contenido-género
CREATE TABLE contenido_genero (
    contenido_genero_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contenido_id CHAR(36) NOT NULL,
    genero_id CHAR(36) NOT NULL,
    FOREIGN KEY (contenido_id) REFERENCES contenido(contenido_id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(genero_id) ON DELETE CASCADE,
    UNIQUE KEY (contenido_id, genero_id)
);

-- Tabla de películas
CREATE TABLE peliculas (
    pelicula_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contenido_id CHAR(36) UNIQUE NOT NULL,
    director_id CHAR(36),
    FOREIGN KEY (contenido_id) REFERENCES contenido(contenido_id) ON DELETE CASCADE,
    FOREIGN KEY (director_id) REFERENCES artistas(artista_id) ON DELETE SET NULL
);

-- Tabla refresh_tokens
CREATE TABLE refresh_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  CONSTRAINT fk_rt_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

ALTER TABLE refresh_tokens 
ADD COLUMN is_revoked TINYINT(1) DEFAULT 0,
ADD COLUMN replaced_by_token VARCHAR(500) NULL,
ADD INDEX idx_user_id (user_id);

ALTER TABLE contenido
ADD COLUMN URLposter VARCHAR(255);

-- 2. Agregar columna URLavatar a la tabla usuarios
ALTER TABLE artistas
ADD COLUMN URLavatar VARCHAR(255);

-- Tabla de relación películas-actores (reparto)
CREATE TABLE peliculas_actores (
    pelicula_id CHAR(36) NOT NULL,
    artista_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pelicula_id, artista_id),
    FOREIGN KEY (pelicula_id) REFERENCES peliculas(pelicula_id) ON DELETE CASCADE,
    FOREIGN KEY (artista_id) REFERENCES artistas(artista_id) ON DELETE CASCADE
) ENGINE=InnoDB;

