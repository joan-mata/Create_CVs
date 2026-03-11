# Especificación Técnica del Formato CV (Bilingüe YAML)

Este documento detalla la estructura admitida por el generador de CVs. El sistema soporta etiquetas tanto en **Español** como en **Inglés**.

## Estructura de Datos y Etiquetas Soportadas

| Categoría | Tag Español | Tag Inglés | Descripción |
| :--- | :--- | :--- | :--- |
| **Básico** | `nombre` | `name` | Nombre completo |
| | `email` | `email` | Email de contacto |
| | `telefono` | `phone` | Teléfono |
| | `ubicacion` | `location` | Ciudad, País |
| **Perfil** | `perfil` | `profile` | Objeto con la descripción |
| | `texto` | `text` | Contenido del perfil |
| **Experiencia** | `experiencia` | `experience` | Lista de trabajos |
| | `puesto` | `position` | Cargo |
| | `empresa` | `company` | Empresa |
| | `fecha` | `date` | Periodo |
| | `descripcion`| `description`| Tareas realizadas |
| **Proyectos** | `proyectos_ingenieria` | `projects` | Lista de proyectos |
| | `nombre` | `name` | Título del proyecto |
| | `tecnologias` | `technologies` | Lista de tecnologías |
| **Educación** | `formacion` | `education` | Estudios realizados |
| | `titulo` | `title` | Título obtenido |
| | `centro` | `institution` | Centro de estudios |
| **Habilidades** | `habilidades` | `skills` | Objeto de habilidades |
| | `tecnicas` | `technical` | Lista de conocimientos |
| | `competencias`| `soft_skills` | Habilidades personales |
| | `idiomas` | `languages` | Idiomas conocidos |

---

## Estructura de Datos (Esquema YAML)

El archivo debe seguir esta jerarquía de etiquetas:

### 1. Información Personal
- `nombre`: (string) Nombre completo. Aparece en el encabezado.
- `email`: (string) Dirección de correo.
- `telefono`: (string) Número de contacto.
- `ubicacion`: (string) Ciudad, País.

### 2. Perfil Profesional
- `perfil`:
  - `texto`: (string) Resumen ejecutivo. Soporta saltos de línea.

### 3. Experiencia Profesional
- `experiencia`: (lista de objetos)
  - `empresa`: (string) Nombre de la entidad.
  - `puesto`: (string) Cargo ocupado.
  - `fecha`: (string) Periodo (ej: "2020 - 2023").
  - `descripcion`: (string) Texto con soporte para viñetas (usar `-` o `*`).

### 4. Proyectos de Ingeniería y Desarrollo Independiente
- `proyectos_ingenieria`: (lista de objetos)
  - `nombre`: (string) Título del proyecto.
  - `fecha`: (string) Fecha o periodo de realización.
  - `tecnologias`: (lista de strings) Ej: `["Python", "Docker"]`.
  - `descripcion`: (string) Funcionalidades y logros (soporta viñetas).

### 5. Formación Académica
- `formacion`: (lista de objetos)
  - `titulo`: (string) Nombre del grado o curso.
  - `centro`: (string) Institución educativa.
  - `fecha`: (string) Año de finalización.
  - `descripcion`: (string, opcional) Detalles adicionales.

### 6. Habilidades y Competencias
- `habilidades`:
  - `tecnicas`: (lista o string) Conocimientos de herramientas y lenguajes.
  - `competencias`: (lista de strings) Habilidades blandas (Soft Skills).
  - `idiomas`: (lista de strings) Idioma y nivel (ej: "Inglés (B2)").

### 7. Certificados
- `certificados`: (lista de objetos)
  - `nombre`: (string) Título de la certificación.
  - `emisor`: (string) Entidad que certifica.
  - `fecha`: (string) Fecha de expedición.

### 8. Voluntariado
- `voluntariado`: (lista de objetos)
  - `organizacion`: (string) Entidad.
  - `rol`: (string) Función desempeñada.
  - `fecha`: (string) Periodo.
  - `descripcion`: (string) Detalles de la actividad.

---

## Funcionalidades de Formato

### Viñetas y Listas
El generador detecta automáticamente líneas que comienzan con `-` o `*` dentro de cualquier campo de `descripcion`:
- **Simples**: `- Tarea realizada`.
- **Anidadas**: Se detectan mediante sangría en el texto del YAML.

### Renderizado de Tecnologías
En la sección de proyectos, las tecnologías se formatean automáticamente en cursiva y separadas por comas.

### Compatibilidad ATS
El diseño utiliza fuentes estándar (Helvetica, Arial) y una estructura jerárquica clara para asegurar que los sistemas de lectura automática (ATS) puedan parsear el contenido sin errores.
