import { z } from "zod";

// Helper para mensajes de error repetitivos
const requiredString = (fieldName) => ({
  required_error: `${fieldName} es obligatorio`,
  invalid_type_error: `${fieldName} debe ser texto`,
});

const requiredNumber = (fieldName) => ({
  required_error: `${fieldName} es obligatorio`,
  invalid_type_error: `${fieldName} debe ser un número`,
});

// 1. Validaciones para Usuarios
export const registerSchema = z.object({
  username: z
    .string(requiredString("El nombre de usuario"))
    .trim()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Solo se permiten letras, números y guiones bajos"
    ),

  email: z
    .string(requiredString("El email"))
    .email("Email inválido")
    .max(100, "El email no puede exceder 100 caracteres"),

  password: z
    .string(requiredString("La contraseña"))
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),

  nombre: z
    .string({ invalid_type_error: "El nombre debe ser texto" })
    .trim()
    .max(50, "El nombre no puede exceder 50 caracteres")
    .optional(),

  apellido: z
    .string({ invalid_type_error: "El apellido debe ser texto" })
    .trim()
    .max(50, "El apellido no puede exceder 50 caracteres")
    .optional(),

  es_admin: z
    .union([
      z.boolean(),
      z.number().int().min(0).max(1),
      z
        .string()
        .refine(
          (val) =>
            val === "true" || val === "1" || val === "false" || val === "0"
        ),
    ])
    .transform((val) => {
      if (typeof val === "string") return val === "true" || val === "1";
      return Boolean(val);
    })
    .optional()
    .default(false),
});

export const loginSchema = z.object({
  usernameOrEmail: z
    .string(requiredString("Usuario o email"))
    .max(150, "No puede exceder 150 caracteres"),

  password: z
    .string(requiredString("La contraseña"))
    .min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export const updateUserSchema = z
  .object({
    username: z
      .string({ invalid_type_error: "El nombre de usuario debe ser texto" })
      .trim()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(50, "El nombre de usuario no puede exceder 50 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Solo se permiten letras, números y guiones bajos"
      )
      .optional(),

    email: z
      .string({ invalid_type_error: "El email debe ser texto" })
      .email("Email inválido")
      .max(100, "El email no puede exceder 100 caracteres")
      .optional(),

    nombre: z
      .string({ invalid_type_error: "El nombre debe ser texto" })
      .trim()
      .max(50, "El nombre no puede exceder 50 caracteres")
      .optional(),

    apellido: z
      .string({ invalid_type_error: "El apellido debe ser texto" })
      .trim()
      .max(50, "El apellido no puede exceder 50 caracteres")
      .optional(),

    activo: z
      .boolean({
        invalid_type_error: "El estado activo debe ser verdadero/falso",
      })
      .optional(),
    
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  });

// 2. Validaciones para Géneros
export const genreSchema = z.object({
  nombre: z
    .string(requiredString("El nombre del género"))
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/,
      "Solo se permiten letras, números y espacios"
    ),

  descripcion: z
    .string({ invalid_type_error: "La descripción debe ser texto" })
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
});

// 3. Validaciones para Artistas
export const artistSchema = z.object({
  nombre: z
    .string(requiredString("El nombre"))
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo se permiten letras y espacios"),

  apellido: z
    .string(requiredString("El apellido"))
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo se permiten letras y espacios"),

  pais_origen: z
    .string({ invalid_type_error: "El país debe ser texto" })
    .max(50, "El país no puede exceder 50 caracteres")
    .optional(),

  URLavatar: z
    .string({ invalid_type_error: "El avatar debe ser una URL válida" })
    .url("Debe ser una URL válida")
    .max(255, "La URL no puede exceder 255 caracteres")
    .optional(),
});

// 4. Validaciones para Contenido
const contentBaseSchema = z.object({
  titulo: z
    .string(requiredString("El título"))
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(100, "El título no puede exceder 100 caracteres"),

  descripcion: z
    .string({ invalid_type_error: "La descripción debe ser texto" })
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional(),

  fecha_lanzamiento: z
    .string(requiredString("La fecha de lanzamiento"))
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido. Use YYYY-MM-DD")
    .transform((str) => new Date(str))
    .refine((date) => date <= new Date(), {
      message: "La fecha no puede ser futura",
    }),

  duracion_min: z
    .number(requiredNumber("La duración"))
    .int("Debe ser un número entero")
    .min(1, "La duración mínima es 1 minuto")
    .max(600, "La duración máxima es 600 minutos"),

  clasificacion: z.enum(["G", "PG", "PG-13", "R", "NC-17", "NR"], {
    required_error: "La clasificación es obligatoria",
    invalid_type_error:
      "Clasificación no válida. Opciones válidas: G, PG, PG-13, R, NC-17, NR",
  }),

  generos: z
    .array(
      z.string(requiredString("El ID de género")).uuid("ID de género inválido"),
      {
        required_error: "Debe seleccionar al menos un género",
        invalid_type_error: "Los géneros deben ser un array",
      }
    )
    .min(1, "Debe seleccionar al menos un género"),
  
  URLposter: z
    .string(requiredString("El póster es obligatorio"))
    .url("Debe ser una URL válida")
    .max(255, "La URL no puede exceder 255 caracteres"),
});

// Esquema para actualización
const updateContentBaseSchema = z.object({
  titulo: z
    .string({ invalid_type_error: "El título debe ser texto" })
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(100, "El título no puede exceder 100 caracteres")
    .optional(),

  descripcion: z
    .string({ invalid_type_error: "La descripción debe ser texto" })
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional(),

  fecha_lanzamiento: z
    .string({ invalid_type_error: "La fecha debe ser texto (YYYY-MM-DD)" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido. Use YYYY-MM-DD")
    .transform((str) => new Date(str))
    .refine((date) => date <= new Date(), {
      message: "La fecha no puede ser futura",
    })
    .optional(),

  duracion_min: z
    .number({ invalid_type_error: "La duración debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "La duración mínima es 1 minuto")
    .max(600, "La duración máxima es 600 minutos")
    .optional(),

  clasificacion: z
    .enum(["G", "PG", "PG-13", "R", "NC-17", "NR"], {
      invalid_type_error: "Clasificación no válida",
    })
    .optional(),

  generos: z
    .array(
      z
        .string({ invalid_type_error: "El ID de género debe ser texto" })
        .uuid("ID de género inválido")
    )
    .min(1, "Debe seleccionar al menos un género")
    .optional(),

  URLposter: z
    .string({ invalid_type_error: "El póster debe ser una URL válida" })
    .url("Debe ser una URL válida")
    .max(255, "La URL no puede exceder 255 caracteres")
    .optional(),
});

export const updateContentSchema = updateContentBaseSchema.refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Debe proporcionar al menos un campo para actualizar",
  }
);

// 5. Validaciones para Películas
export const movieSchema = contentBaseSchema.extend({
  director_id: z
    .string({ invalid_type_error: "El ID de director debe ser texto" })
    .uuid("ID de director inválido")
    .optional()
    .nullable(),
});

export const MovieActor = z.object({
  actor_id: z
    .string({ invalid_type_error: "El ID de actor debe ser texto" })
    .uuid("ID de actor inválido")
    .optional()
    .nullable(),
});

export const updateMovieSchema = updateContentBaseSchema
  .extend({
    director_id: z
      .string({ invalid_type_error: "El ID de director debe ser texto" })
      .uuid("ID de director inválido")
      .optional()
      .nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  });

// 6. Validaciones para Búsqueda
export const movieSearchSchema = z
  .object({
    query: z
      .string({ invalid_type_error: "La búsqueda debe ser texto" })
      .min(1, "La búsqueda no puede estar vacía")
      .max(100, "La búsqueda no puede exceder 100 caracteres")
      .optional(),

    genero: z
      .string({ invalid_type_error: "El género debe ser texto (UUID)" })
      .uuid("ID de género inválido")
      .optional(),

    director: z
      .string({ invalid_type_error: "El director debe ser texto (UUID)" })
      .uuid("ID de director inválido")
      .optional(),

    clasificacion: z
      .enum(["G", "PG", "PG-13", "R", "NC-17", "NR"], {
        invalid_type_error: "Clasificación no válida",
      })
      .optional(),

    year_from: z
      .number({ invalid_type_error: "El año inicial debe ser número" })
      .int()
      .min(1900, "El año mínimo es 1900")
      .max(new Date().getFullYear(), "El año no puede ser futuro")
      .optional(),

    year_to: z
      .number({ invalid_type_error: "El año final debe ser número" })
      .int()
      .min(1900, "El año mínimo es 1900")
      .max(new Date().getFullYear(), "El año no puede ser futuro")
      .optional(),

    sort_by: z
      .enum(["titulo", "fecha_lanzamiento", "promedio_calificacion"], {
        invalid_type_error: "Campo de ordenación no válido",
      })
      .optional(),

    sort_order: z
      .enum(["asc", "desc"], {
        invalid_type_error: "Orden no válido (use asc/desc)",
      })
      .optional(),

    limit: z
      .number({ invalid_type_error: "El límite debe ser número" })
      .int()
      .min(1, "El límite mínimo es 1")
      .max(100, "El límite máximo es 100")
      .default(20),

    offset: z
      .number({ invalid_type_error: "El offset debe ser número" })
      .int()
      .min(0, "El offset no puede ser negativo")
      .default(0),
  })
  .refine(
    (data) =>
      !data.year_to || !data.year_from || data.year_to >= data.year_from,
    {
      message: "El año final debe ser mayor o igual al año inicial",
      path: ["year_to"],
    }
  );

// 7. Validaciones para Calificaciones
export const ratingSchema = z.object({
  contenido_id: z
    .string(requiredString("El ID de contenido"))
    .uuid("ID de contenido inválido"),

  calificacion: z
    .number(requiredNumber("La calificación"))
    .min(0, "La calificación mínima es 0")
    .max(10, "La calificación máxima es 10")
    .multipleOf(0.5, "La calificación debe ser múltiplo de 0.5"),

  comentario: z
    .string({ invalid_type_error: "El comentario debe ser texto" })
    .max(500, "El comentario no puede exceder 500 caracteres")
    .optional(),
});

// 8. Validaciones para Tokens y Autenticación
export const refreshTokenSchema = z.object({
  token: z
    .string(requiredString("El token"))
    .min(100, "Token inválido")
    .max(500, "Token inválido"),

  expires_at: z
    .string(requiredString("La fecha de expiración"))
    .datetime({ message: "Formato de fecha inválido" })
    .transform((str) => new Date(str))
    .refine((date) => date > new Date(), {
      message: "El token ya ha expirado",
    }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(requiredString("La contraseña actual")),

    newPassword: z
      .string(requiredString("La nueva contraseña"))
      .min(8, "La contraseña debe tener mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  });
