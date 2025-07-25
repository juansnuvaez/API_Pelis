# Pelis API - Sistema de Gestión de Películas con Node.js
🎬 Características principales
Autenticación JWT con tokens de acceso y refresco

Roles de usuario (admin/regular) con control de acceso

CRUD completo para películas, actores, géneros y usuarios

Validación de datos con Zod

Base de datos MySQL con estructura relacional

Manejo de errores robusto y detallado

Paginación para listados extensos

Relaciones complejas entre entidades (películas-actores-géneros)

Seguridad reforzada con middlewares específicos

# 🏗️ Estructura del proyecto


pelis-api/
├── config/
│   ├── db.js          # Configuración de conexión a MySQL
│   └── env.js         # Gestión de variables de entorno
├── controllers/
│   ├── actorsControllers.js  # Lógica para actores
│   ├── authControllers.js    # Autenticación y usuarios
│   ├── genresControllers.js  # Gestión de géneros
│   └── movieController.js    # Operaciones con películas
├── middleware/
│   ├── authMiddleware.js     # Verificación JWT
│   └── validateMiddleware.js # Validación de datos
├── routes/
│   ├── actorsRoutes.js       # Endpoints para actores
│   ├── allRoutes.js          # Agrupador de rutas
│   ├── genresRoutes.js       # Rutas para géneros
│   ├── moviesRoutes.js       # Rutas de películas
│   └── usersRoutes.js        # Autenticación de usuarios
├── sql/
│   ├── pelis.sql             # Esquema de la base de datos
│   └── inserts.sql           # Datos iniciales
├── util/
│   ├── jwt.js                # Manejo de tokens JWT
│   ├── password.js           # Hashing de contraseñas
│   ├── queries.js            # Consultas SQL organizadas
│   └── schemaValidator.js    # Esquemas de validación con Zod
└── .env.example              # Plantilla de configuración

# 🚀 Instalación y configuración
Requisitos previos

Node.js v14+

MySQL v8+

npm o yarn

Clonar e instalar dependencias

git clone <repo-url>
cd pelis-api
npm install
Configuración de la base de datos

mysql -u root -p < sql/pelis.sql
mysql -u root -p pelis < sql/inserts.sql
Variables de entorno (crear .env basado en .env.example)

env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pelis
DB_USER=root
DB_PASS=
ACCESS_TOKEN_SECRET=tu_secreto_jwt
REFRESH_TOKEN_SECRET=tu_secreto_refresco_jwt
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
Iniciar el servidor

npm run dev  # Modo desarrollo
npm start   # Producción
🔐 Autenticación
Flujo JWT con refresh tokens
Registro de usuario

POST /auth/register
{
  "username": "nuevo_user",
  "email": "user@example.com",
  "password": "Password123"
}
Login (devuelve access + refresh tokens)

POST /auth/login
{
  "usernameOrEmail": "nuevo_user",
  "password": "Password123"
}
Refrescar token (cuando el access token expira)

POST /auth/refresh
{
  "token": "<refresh_token>"
}
Autorización requerida en endpoints protegidos:

Authorization: Bearer <access_token>

# 🎥 Endpoints principales
**🎞️ Películas** 
Método	Endpoint	Descripción	Requiere Admin
GET	/movies/all	Obtener todas las películas	No
GET	/movies/:id	Obtener película por ID	No
POST	/movies	Crear nueva película	Sí
PUT	/movies/:id	Actualizar película	Sí
DELETE	/movies/:id	Eliminar película	Sí
GET	/movies/:id/actors	Actores de una película	No
POST	/movies/:id/actors	Añadir actor a película	Sí
**🌟 Actores**
Método	Endpoint	Descripción	Requiere Admin
GET	/actors	Listar actores (paginado)	No
GET	/actors/:id	Obtener actor por ID	No
POST	/actors	Crear nuevo actor	Sí
PUT	/actors/:id	Actualizar actor	Sí
DELETE	/actors/:id	Eliminar actor	Sí
**🎭 Géneros**
Método	Endpoint	Descripción	Requiere Admin
GET	/genres	Listar todos los géneros	No
GET	/genres/:id	Obtener género por ID	No
POST	/genres	Crear nuevo género	Sí
PUT	/genres/:id	Actualizar género	Sí
DELETE	/genres/:id	Eliminar género	Sí

# 💡 Ejemplos de uso
Crear película (como admin)

curl -X POST http://localhost:3000/movies \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "El Padrino",
    "descripcion": "Clásico del cine...",
    "fecha_lanzamiento": "1972-03-24",
    "duracion_min": 175,
    "clasificacion": "R",
    "generos": ["44444444-4444-4444-4444-444444444444"],
    "director_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  }'
Añadir actor a película

curl -X POST http://localhost:3000/movies/1/actors \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "actor_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
  }'
Obtener películas con filtros

curl -X GET "http://localhost:3000/movies/all?genero=44444444-4444-4444-4444-444444444444&year_from=2000"

# 🛡️ Seguridad
Tokens JWT firmados con secretos seguros

Contraseñas hasheadas con bcrypt

Middleware de autenticación para rutas protegidas

Validación estricta de todos los inputs con Zod

Control de acceso basado en roles (adminOnly middleware)

Manejo seguro de errores sin exponer detalles sensibles

# 🤝 Contribución
Haz fork del proyecto

Crea tu rama de feature (git checkout -b feature/awesome-feature)

Commit tus cambios (git commit -am 'Add awesome feature')

Push a la rama (git push origin feature/awesome-feature)

Abre un Pull Request

# 📄 Licencia
MIT License - ver LICENSE para más detalles.