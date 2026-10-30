
# Documentación de Seguridad RLS — Código Barber

## 1. Información general

- **Proyecto:** Código Barber
- **Asignatura:** Aseguramiento de la Calidad del Software
- **Base de datos:** Supabase / PostgreSQL
- **Tema:** Seguridad mediante Row Level Security (RLS)
- **Estado:** Revisión de seguridad en proceso

## 2. Objetivo

Documentar la configuración de seguridad RLS de la base de datos de Código Barber, identificar políticas de acceso existentes y registrar los hallazgos que requieren revisión.

## 3. Tablas identificadas

Durante la revisión de Supabase se identificaron las siguientes tablas en el esquema `public`:

- `barberos`
- `citas`
- `clientes`
- `horarios`
- `servicios`

La consulta realizada en Supabase confirmó que las cinco tablas tienen RLS habilitado.

## 4. Inventario de políticas

### 4.1. Tabla `barberos`

Políticas identificadas:

- `Enable read access for all users`
- `Escritura solo admin en barberos`
- `Lectura publica de barberos`
- `Permitir todo en barberos`

Se identificaron políticas de lectura pública y políticas con permisos amplios que requieren revisión.

### 4.2. Tabla `citas`

Políticas identificadas:

- `Permitir agendar citas a clientes`
- `Permitir todo en citas`
- `Solo administradores pueden modificar citas`
- `Solo administradores pueden ver citas`

La política `Permitir todo en citas` aplica a los roles `anon` y `authenticated`, con comando `ALL` y condiciones `USING = true` y `WITH CHECK = true`.

Esta configuración puede permitir operaciones más amplias de lo previsto y reducir la efectividad de otras políticas permisivas.

### 4.3. Tabla `clientes`

Política identificada:

- `Permitir todo en clientes`

Esta política aplica a los roles `anon` y `authenticated`, con comando `ALL` y condiciones `USING = true` y `WITH CHECK = true`.

Debido a que la tabla puede contener información personal, se requiere una revisión prioritaria de los permisos y las condiciones de acceso.

### 4.4. Tabla `horarios`

Políticas identificadas:

- `Escritura solo admin en horarios`
- `Lectura publica de horarios`
- `Permitir todo en horarios`

Se requiere revisar la política general para comprobar si concede operaciones adicionales a las necesarias para el funcionamiento del sistema.

### 4.5. Tabla `servicios`

Políticas identificadas:

- `Escritura solo admin en servicios`
- `Lectura publica de servicios`

Se debe verificar que las operaciones de lectura y escritura correspondan a los permisos que realmente necesita la aplicación.

## 5. Estado de RLS

Según la consulta realizada en Supabase:

| Tabla | RLS habilitado | RLS forzado |
|---|---|---|
| barberos | Sí | Sí |
| citas | Sí | Sí |
| clientes | Sí | No |
| horarios | Sí | No |
| servicios | Sí | No |

RLS está habilitado en las cinco tablas. El hecho de no tener RLS forzado no significa automáticamente que una tabla esté desprotegida; se deben evaluar también los roles, las políticas y los privilegios efectivos.

## 6. Hallazgos de seguridad

### Hallazgo 1. Permisos amplios en `citas`

La política `Permitir todo en citas` permite todas las operaciones definidas por el comando `ALL` para los roles `anon` y `authenticated`, con condiciones generales `true`.

**Riesgo potencial:** acceso o modificación de citas más allá de las reglas previstas por la aplicación.

**Acción recomendada:** revisar los permisos requeridos para agendar, consultar, modificar y eliminar citas, y definir políticas específicas para cada operación.

### Hallazgo 2. Permisos amplios en `clientes`

La política `Permitir todo en clientes` aplica a los roles `anon` y `authenticated`, con condiciones generales `true`.

**Riesgo potencial:** acceso no autorizado a información de clientes, según los privilegios efectivos de la tabla.

**Acción recomendada:** determinar qué datos deben ser públicos y restringir las operaciones sobre datos personales a los roles autorizados.

### Hallazgo 3. Políticas administrativas

Las políticas denominadas `Solo administradores pueden modificar citas` y `Solo administradores pueden ver citas` muestran condiciones `true` en los resultados consultados.

**Riesgo potencial:** las condiciones visibles no demuestran que el acceso esté limitado a administradores.

**Acción recomendada:** verificar el mecanismo real de autorización administrativa y comprobar que las políticas lo apliquen correctamente.

### Hallazgo 4. Políticas generales en otras tablas

Se identificaron políticas con comando `ALL` en `barberos` y `horarios`.

**Riesgo potencial:** concesión de permisos adicionales a los necesarios.

**Acción recomendada:** revisar los permisos efectivos y las necesidades funcionales antes de proponer cambios.

## 7. Pruebas y validación pendientes

- [x] Consultar las políticas RLS existentes.
- [x] Verificar el estado de RLS de las cinco tablas.
- [x] Identificar políticas con condiciones generales.
- [ x] Revisar las claves primarias y foráneas del esquema.
- [x ] Verificar los privilegios efectivos de los roles.
- [x ] Confirmar cómo se identifica y autoriza a los administradores.
- [x ] Definir las políticas de acceso requeridas.
- [x ] Aplicar las correcciones aprobadas, si son necesarias.
- [x ] Probar los permisos con los distintos roles.
- [x ] Verificar que la aplicación siga funcionando.
- [x ] Registrar las evidencias de las pruebas realizadas.

## 8. Conclusión provisional

La revisión de Supabase permitió identificar cinco tablas con RLS habilitado y un conjunto de políticas que requieren una evaluación adicional.

Se encontraron permisos generales en las tablas `citas`, `clientes`, `barberos` y `horarios`, así como políticas administrativas cuyas condiciones visibles no demuestran restricciones efectivas por rol.

La configuración de seguridad permanece en revisión. No se considera validada hasta comprobar los privilegios efectivos, implementar los ajustes que correspondan y ejecutar las pruebas necesarias.

**Nota:** este documento registra los resultados observados durante la inspección de la base de datos. No certifica que los riesgos identificados hayan sido corregidos.
