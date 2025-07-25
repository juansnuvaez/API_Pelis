-- Insertar usuarios
INSERT INTO usuarios (id, username, email, password_hash, nombre, apellido, ultimo_login, es_admin) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@pelis.com', '$2a$10$xJwL5v5Jz5z5z5z5z5z5zO5z5z5z5z5z5z5z5z5z5z5z5z5z5z', 'Admin', 'Sistema', NOW(), TRUE),
('22222222-2222-2222-2222-222222222222', 'usuario1', 'usuario1@pelis.com', '$2a$10$xJwL5v5Jz5z5z5z5z5z5zO5z5z5z5z5z5z5z5z5z5z5z5z5z5z', 'Juan', 'Pérez', NOW(), FALSE),
('33333333-3333-3333-3333-333333333333', 'usuario2', 'usuario2@pelis.com', '$2a$10$xJwL5v5Jz5z5z5z5z5z5zO5z5z5z5z5z5z5z5z5z5z5z5z5z5z', 'María', 'Gómez', NOW(), FALSE);

-- Insertar géneros
INSERT INTO generos (genero_id, nombre, descripcion) VALUES
('44444444-4444-4444-4444-444444444444', 'Acción', 'Películas con mucha acción y aventuras'),
('55555555-5555-5555-5555-555555555555', 'Comedia', 'Películas divertidas y humorísticas'),
('66666666-6666-6666-6666-666666666666', 'Drama', 'Películas serias con desarrollo de personajes'),
('77777777-7777-7777-7777-777777777777', 'Ciencia Ficción', 'Películas con elementos futuristas y tecnológicos'),
('88888888-8888-8888-8888-888888888888', 'Terror', 'Películas diseñadas para asustar');

-- Insertar artistas (actores y directores)
INSERT INTO artistas (artista_id, nombre, apellido, pais_origen) VALUES
('99999999-9999-9999-9999-999999999999', 'Christopher', 'Nolan', 'Reino Unido'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quentin', 'Tarantino', 'Estados Unidos'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Leonardo', 'DiCaprio', 'Estados Unidos'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tom', 'Hanks', 'Estados Unidos'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Meryl', 'Streep', 'Estados Unidos'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Scarlett', 'Johansson', 'Estados Unidos');

-- Insertar contenido
INSERT INTO contenido (contenido_id, titulo, descripcion, fecha_lanzamiento, duracion_min, clasificacion, promedio_calificacion) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Inception', 'Un ladrón que roba secretos corporativos a través del uso de tecnología de sueños compartidos.', '2010-07-16', 148, 'PG-13', 8.8),
('11111111-1111-1111-1111-111111111112', 'Pulp Fiction', 'Las vidas de dos mafiosos, un boxeador, la esposa de un gánster y un par de bandidos se entrelazan.', '1994-10-14', 154, 'R', 8.9),
('11111111-1111-1111-1111-111111111113', 'Forrest Gump', 'Las presidencias de Kennedy y Johnson, los eventos de Vietnam, Watergate y otros eventos históricos vistos a través de los ojos de un hombre con coeficiente intelectual bajo.', '1994-07-06', 142, 'PG-13', 8.8),
('11111111-1111-1111-1111-111111111114', 'The Devil Wears Prada', 'Una joven recién graduada que consigue un trabajo como asistente de una poderosa editora de una revista de moda.', '2006-06-30', 109, 'PG-13', 6.9);

-- Insertar relación contenido-género
INSERT INTO contenido_genero (contenido_genero_id, contenido_id, genero_id) VALUES
(UUID(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444'), -- Inception - Acción
(UUID(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777'), -- Inception - Ciencia Ficción
(UUID(), '11111111-1111-1111-1111-111111111112', '44444444-4444-4444-4444-444444444444'), -- Pulp Fiction - Acción
(UUID(), '11111111-1111-1111-1111-111111111112', '66666666-6666-6666-6666-666666666666'), -- Pulp Fiction - Drama
(UUID(), '11111111-1111-1111-1111-111111111113', '66666666-6666-6666-6666-666666666666'), -- Forrest Gump - Drama
(UUID(), '11111111-1111-1111-1111-111111111114', '55555555-5555-5555-5555-555555555555'), -- The Devil Wears Prada - Comedia
(UUID(), '11111111-1111-1111-1111-111111111114', '66666666-6666-6666-6666-666666666666'); -- The Devil Wears Prada - Drama

-- Insertar películas
INSERT INTO peliculas (pelicula_id, contenido_id, director_id) VALUES
(UUID(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', '99999999-9999-9999-9999-999999999999'), -- Inception - Christopher Nolan
(UUID(), '11111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Pulp Fiction - Quentin Tarantino
(UUID(), '11111111-1111-1111-1111-111111111113', NULL), -- Forrest Gump - Director no especificado
(UUID(), '11111111-1111-1111-1111-111111111114', NULL); -- The Devil Wears Prada - Director no especificado

-- Insertar relación películas-actores (reparto)
INSERT INTO peliculas_actores (pelicula_id, artista_id) VALUES
-- Inception
((SELECT pelicula_id FROM peliculas WHERE contenido_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), -- Leonardo DiCaprio
-- Pulp Fiction
((SELECT pelicula_id FROM peliculas WHERE contenido_id = '11111111-1111-1111-1111-111111111112'), 'cccccccc-cccc-cccc-cccc-cccccccccccc'), -- Tom Hanks
-- Forrest Gump
((SELECT pelicula_id FROM peliculas WHERE contenido_id = '11111111-1111-1111-1111-111111111113'), 'cccccccc-cccc-cccc-cccc-cccccccccccc'), -- Tom Hanks
-- The Devil Wears Prada
((SELECT pelicula_id FROM peliculas WHERE contenido_id = '11111111-1111-1111-1111-111111111114'), 'dddddddd-dddd-dddd-dddd-dddddddddddd'), -- Meryl Streep
((SELECT pelicula_id FROM peliculas WHERE contenido_id = '11111111-1111-1111-1111-111111111114'), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Scarlett Johansson

-- Insertar refresh tokens (ejemplo)
INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked) VALUES
('11111111-1111-1111-1111-111111111111', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJpYXQiOjE2MTg5MzQwMjIsImV4cCI6MTYyMTUyNjAyMn0.4j5X3Y9z7V0Q9z7V0Q9z7V0Q9z7V0Q9z7V0Q9z7V0Q9', DATE_ADD(NOW(), INTERVAL 30 DAY), 0),
('22222222-2222-2222-2222-222222222222', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMjIyMjIyMi0yMjIyLTIyMjItMjIyMi0yMjIyMjIyMjIyMjIiLCJpYXQiOjE2MTg5MzQwMjIsImV4cCI6MTYyMTUyNjAyMn0.4j5X3Y9z7V0Q9z7V0Q9z7V0Q9z7V0Q9z7V0Q9z7V0Q9', DATE_ADD(NOW(), INTERVAL 30 DAY), 0);