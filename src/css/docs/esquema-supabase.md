# Esquema de Base de Datos — Código Barber

## 1. Información general

- **Proyecto:** Código Barber
- **Asignatura:** Aseguramiento de la Calidad del Software
- **Motor de base de datos:** PostgreSQL
- **Plataforma:** Supabase
- **Esquema:** `public`

## 2. Objetivo

Documentar la estructura de las tablas de la base de datos de Código Barber, sus columnas, tipos de datos, valores predeterminados y relaciones identificadas durante la inspección de Supabase.

## 3. Tablas de la base de datos

Se identificaron cinco tablas principales:

- `barberos`
- `citas`
- `clientes`
- `horarios`
- `servicios`

### 3.1. Tabla `barberos`

| Columna | Tipo de dato | Permite nulos | Valor predeterminado |
|---|---|---|---|
| `id` | bigint | No | Ninguno |
| `created_at` | timestamp with time zone | No | `now()` |
| `nombre` | text | Sí | Ninguno |
| `especialidad` | text | Sí | Ninguno |

**Descripción:** almacena información de los barberos registrados en el sistema.

### 3.2. Tabla `citas`

| Columna | Tipo de dato | Permite nulos | Valor predeterminado |
|---|---|---|---|
| `id` | bigint | No | Ninguno |
| `cliente` | text | Sí | Ninguno |
| `cliente_id` | bigint | Sí | Ninguno |
| `nombre` | text | Sí | Ninguno |
| `telefono` | text | Sí | Ninguno |
| `servicio` | text | Sí | Ninguno |
| `servicio_id` | bigint | Sí | Ninguno |
| `barbero` | text | Sí | Ninguno |
| `barbero_id` | bigint | Sí | Ninguno |
| `fecha` | date | No | `CURRENT_DATE` |
| `hora` | text | No | `'00:00'` |
| `estado` | text | No | `'Pendiente'` |
| `created_at` | timestamp with time zone | Por verificar | `now()` |

**Descripción:** registra las citas del sistema, incluyendo información del cliente, servicio, barbero, fecha, hora y estado.

La información de esta tabla contiene tanto campos de identificación como nombres descriptivos. Se debe verificar si todos son necesarios y cómo se relacionan con las tablas de clientes, servicios y barberos.

### 3.3. Tabla `clientes`

| Columna | Tipo de dato | Permite nulos | Valor predeterminado |
|---|---|---|---|
| `id` | bigint | No | Ninguno |
| `nombre` | text | No | Ninguno |
| `telefono` | text | Sí | Ninguno |
| `created_at` | timestamp with time zone | Por verificar | `now()` |

**Descripción:** almacena información de los clientes. Debido a la presencia de datos personales, su acceso debe estar sujeto a controles de seguridad apropiados.

### 3.4. Tabla `horarios`

| Columna | Tipo de dato | Permite nulos | Valor predeterminado |
|---|---|---|---|
| `id` | bigint | No | Ninguno |
| `dias` | text | No | Ninguno |
| `horario` | text | No | Ninguno |

**Descripción:** almacena información de los días y horarios de atención configurados en el sistema.

### 3.5. Tabla `servicios`

| Columna | Tipo de dato | Permite nulos | Valor predeterminado |
|---|---|---|---|
| `id` | bigint | No | Ninguno |
| `nombre` | text | Por verificar | Ninguno |
| `duracion` | text | Por verificar | Ninguno |
| `precio` | text | Por verificar | Ninguno |

**Descripción:** almacena los servicios ofrecidos por la barbería, incluyendo su nombre, duración y precio.

## 4. Relaciones y restricciones identificadas

Durante la inspección de las restricciones de la base de datos se identificaron los siguientes elementos:

- `citas.id`: clave primaria de la tabla `citas`.
- `barberos.id`: identificador de los barberos.
- `clientes.id`: clave primaria de la tabla `clientes`.
- `horarios.id`: clave primaria de la tabla `horarios`.
- `servicios.id`: clave primaria de la tabla `servicios`.
- `citas.barbero_id`: clave foránea que referencia a `barberos.id`, mediante la restricción `fk_citas_barberos`.
- `cita_barbero_unica`: restricción de unicidad que involucra `barbero_id`, `fecha` y `hora`. Se debe verificar su definición completa para confirmar cómo evita los conflictos de horarios.

Aunque existen columnas llamadas `cliente_id` y `servicio_id` en la tabla `citas`, sus relaciones con las tablas correspondientes todavía deben verificarse.

## 5. Consideraciones técnicas

### 5.1. Tipos de datos

Se observó que las columnas `duracion` y `precio` de la tabla `servicios` utilizan el tipo `text`.

Se recomienda evaluar si estos tipos son adecuados para las operaciones previstas. Por ejemplo, un precio podría representarse mediante un tipo numérico apropiado, mientras que la duración podría almacenarse como un número de minutos o un intervalo.

Cualquier cambio debe evaluarse y probarse antes de aplicarse a la base de datos de producción.

### 5.2. Integridad referencial

Se debe verificar que las relaciones entre citas, clientes, servicios y barberos correspondan al funcionamiento real de la aplicación y que las restricciones de integridad estén correctamente definidas.

### 5.3. Seguridad

Las tablas identificadas tienen RLS habilitado, según la consulta realizada en Supabase. Las políticas existentes se documentan por separado en `docs/seguridad-rls.md`.

El estado de RLS no sustituye la revisión de los privilegios, las políticas ni las pruebas de acceso.

## 6. Verificaciones pendientes

- [x] Identificar las cinco tablas del esquema `public`.
- [x] Consultar las columnas y sus tipos de datos.
- [x] Identificar la relación entre `citas.barbero_id` y `barberos.id`.
- [ ] Confirmar todos los valores de nulabilidad y valores predeterminados.
- [ ] Verificar las claves primarias de todas las tablas.
- [ ] Verificar las relaciones de `cliente_id` y `servicio_id`.
- [ ] Confirmar la definición completa de `cita_barbero_unica`.
- [ ] Revisar la adecuación de los tipos de datos.
- [ ] Validar el esquema con pruebas de la aplicación.

## 7. Conclusión provisional

La inspección de Supabase permitió identificar las cinco tablas principales de Código Barber y documentar gran parte de sus columnas y restricciones.

La documentación se considera inicial y requiere completar las verificaciones pendientes antes de afirmar que el esquema está totalmente validado.

Este documento describe la estructura observada y no implica que se hayan realizado modificaciones en la base de datos.
