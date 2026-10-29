# Código Barber

Código Barber es una pagina web para consultar servicios, perfiles de barberos y gestionar reservas de citas en una barbería esta version combina una interfaz pública de atención al cliente con un panel administrativo restringido para la gestión de citas y catalogación de servicios y barberos

URL pública: https://codigo-barber.vercel.app/

## A. Nombre del proyecto

Código Barber es una solución frontend orientada a la reserva de turnos para una barbería su objetivo es permitir a los clientes revisar servicios, revisar perfiles del equipo y programar citas en línea, mientras el personal autorizado puede gestionar la agenda desde un panel privado

## B. Descripción general

- Problema que resuelve: centraliza la información de servicios, barberos y disponibilidad para facilitar la reserva de citas sin depender de llamadas o tener que ir presencial a la barberia 
- Público objetivo: clientes de una barbería que desean consultar servicios y reservar su turno, y personal administrativo que necesita gestionar citas y catálogo 
- Beneficios para el cliente: consulta rápida de servicios y barberos, reserva guiada con validación de teléfono y confirmación del horario
- Beneficios para el barbero: visualización centralizada de citas, filtro por fecha/barbero, control de estado de cada cita y administración de catálogo de servicios
- Alcance actual: la pagina implementa la landing page, flujo de reserva, panel administrativo y gestión básica de catálogo, pero la configuración de base de datos y acceso real depende de una instancia de Supabase previamente creada

### Estado funcional observado

- Implementado: landing page, catálogo de servicios, perfiles de barberos, galería, proceso de reserva con validación de celular colombiano, panel de administración, gestión de citas, gestión de barberos y servicios, recuperación de contraseña.
- Parcialmente implementado: administración de horarios existe en la interfaz, pero la lógica de persistencia y flujo real de horarios depende de la estructura creada en Supabase.
- Pendiente por confirmar: una base de datos SQL reproducible, un script de inicialización, y usuarios de prueba documentados y accesibles 

## C. Funcionalidades implementadas

La aplicación incluye estas funciones:

- Página principal con hero section, navegación, servicios, barberos y galería
- Sección de reservas con flujo por pasos (servicio, barbero, fecha, hora, confirmación)
- Validación de número telefónico colombiano en la reserva
- Verificación de disponibilidad antes de guardar una cita por barbero, fecha y hora
- Panel administrativo privado con acceso por autenticación de Supabase
- Dashboard con conteo de citas de hoy, pendientes, atendidas y canceladas
- Tabla de reservas con filtros por fecha, barbero y búsqueda por cliente
- Cambio de estado de citas entre pendiente, atendida y cancelada
- Administración de barberos y servicios desde la vista de perfil/configuración
- Recuperación y cambio de contraseña para el usuario administrativo
- Diseño responsive para escritorio y móvil


### Limitaciones detectadas

- No se incluye un backend propio ni un archivo SQL con el esquema de la base de datos.
- La configuración del cliente de Supabase está embebida directamente en `src/js/supabase.js` y no utiliza un archivo `.env` del proyecto
- El acceso administrativo está restringido a una cuenta determinada, no a una lista dinámica de roles
- La página de perfil incluye la gestión de horarios, pero la persistencia de esos horarios no está documentada en este repositorio como un script reproducible

## D. Tecnologías utilizadas

 Tecnología | Versión declarada / observada | Función dentro del proyecto |

 HTML5 - Estructura de páginas publicas y administrativas 
 CSS3  - Estilos visuales, layout y diseño responsive 
 JavaScript ES Modules -  Lógica del frontend y consumo de Supabase 
 Node.js  20.19+  22.12+ (requerido por Vite 8)  Entorno de ejecución para desarrollo 
 npm  -  Gestión de dependencias y scripts 
 Vite  ^8.2.2  Servidor de desarrollo y compilación para producción 
 SweetAlert2  ^11.26.25  Modales y alertas de usuario 
 Supabase Auth  -  Inicio de sesión, logout y recuperación de contraseña 
 Supabase JS SDK - importado por CDN (`jsDelivr`)  Cliente para lectura/escritura a la base de datos 
 PostgreSQL (Supabase) | gestionado por Supabase Persistencia de reservas, servicios, barberos y clientes 
 Vercel  -  Despliegue y hosting estático |

Nota: el repositorio no incluye una dependencia declarada de `@supabase/supabase-js` en `package.json`; se importa desde CDN en `src/js/supabase.js`.

## E. Requisitos previos

- Sistema operativo compatible con Node.js y Vite (Windows, macOS o Linux)
- Node.js 20.19+ o 22.12+.
- npm.
- Navegador actual
- Cuenta y proyecto de Supabase configurado
- Acceso a Vercel o a cualquier hosting compatible si se desea desplegar la versión publicada

## F. Instalación paso a paso

1. Clonar el repositorio o descargar el código fuente en tu equipo
2. Abrir la carpeta raíz del proyecto en VS Code o la terminal que prefieras
3. Instalar dependencias:


npm install


4. Verificar la configuración de Supabase en `src/js/supabase.js` y ajustar la URL y la clave si tu proyecto en Supabase es diferente
5. Crear o conectar la base de datos y la autenticación en Supabase con las tablas que usa la aplicación
6. Ejecutar en modo desarrollo:


npm run dev


7. Abrir la URL mostrada por Vite en la terminal que puede ser 

http://localhost:5173/


8. Para compilar la versión de producción:


npm run build


9. Para revisar la compilación localmente:

npm run preview


## G. Variables de entorno

No hay un archivo `.env` ni variables de entorno configuradas en el repositorio actual

La aplicación actualmente usa un cliente de Supabase inicializado directamente en `src/js/supabase.js` con la URL y una clave pública Si se decide migrar a un enfoque más portable, la forma recomendada sería usar variables de entorno con nombres similares a estos:

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica


## H. Ejecución de la aplicación

### Desarrollo local

npm run dev

- Puerto por defecto: `5173`
- URL esperada: `http://localhost:5173/`
- Si el puerto está ocupado, Vite normalmente selecciona otro puerto disponible y lo muestra en la terminal

### Producción

npm run build
npm run preview


- El resultado se genera en la carpeta `dist/`.
- La vista previa generalmente usa un puerto local asignado por Vite


## I. Base de datos y persistencia

La aplicación no tiene un backend propio en este repositorio. La persistencia real se realiza a través de Supabase desde el navegador, utilizando el cliente JavaScript importado en `src/js/supabase.js`

### Entidades observadas en el código

 Tabla / recurso | Uso observado en el código | Comentario |

 `citas`  reserva, consulta, actualización de estado, validación de disponibilidad  es la tabla principal del sistema 
 `barberos`  listado y gestión del catálogo  se consulta en la vista de perfil 
 `servicios`  listado y gestión del catálogo  incluye duración y precio 
 `clientes` asociación de cliente con una reserva  se usa en consultas con relación 
 `auth` (Supabase)  login, logout, recuperación de contraseña  autenticación del panel 

### Campos que el código espera usar

- `barberos`: `id`, `nombre`, `especialidad`
- `servicios`: `id`, `nombre`, `duracion`, `precio`
- `citas`: `id`, `cliente_nombre`, `cliente_telefono`, `servicio`, `barbero`, `fecha`, `hora`, `estado`
- Relaciones: `citas` se consulta junto con `clientes`, `barberos` y `servicios`

### Nota importante sobre la base de datos

No existe un script SQL reproducible en el repositorio para crear esta estructura la pagina web asume que una instancia de Supabase ya tiene estas tablas con los campos y relaciones necesarias

## J. Usuarios y datos de prueba

El repositorio no incluye un archivo con credenciales de demostración ni usuarios de prueba listos para uso

Lo que sí está implementado es lo siguiente:

- La autenticación del panel está restringida por `ADMIN_EMAIL` en `src/js/admin-auth.js`
- El login público de clientes no exige cuenta previa; la reserva se hace con datos personales temporales
- El acceso administrativo requiere que exista una cuenta autenticada en Supabase que coincida con la cuenta autorizada configurada en la aplicación



Para pruebas del cliente:

- Usar datos ficticios en el formulario de reserva.
- Probar con nombres y teléfonos ficticios para evitar exponer datos reales

## K. Guía de pruebas funcionales

ID | Funcionalidad  Pasos de ejecución  Resultado esperado  Estado 

 TC-01 -  Consultar servicios  Abrir la página principal y revisar la sección de servicios | Se visualizan los servicios con nombre, duración y precio  Pendiente validación manual 
 TC-02 - Visualizar barberos  Ir a la sección de barberos  Se muestran los perfiles del equipo con foto, experiencia y especialidad  Pendiente validación manual 
 TC-03 - Crear reserva  Completar paso a paso el formulario y confirmar  La cita queda registrada en Supabase y muestra el resumen final  Pendiente validación manual 
 TC-04 - Validar horario ocupado  Intentar reservar el mismo barbero, fecha y hora dos veces  El sistema bloquea la duplicidad con una alerta Pendiente validación manual 
 TC-05 - Validar teléfono  Ingresar un número inválido  El sistema muestra un mensaje de advertencia  Pendiente validación manual 
 TC-06 - Iniciar sesión admin  Acceder a `/login.html` con una cuenta autorizada  Se redirige al dashboard y se mantiene la sesión  Pendiente validación manual 
 TC-07 - Gestionar reservas  Ir a `/reservas.html` y cambiar el estado de una cita  El cambio se refleja en la tabla y en Supabase  Pendiente validación manual 
 TC-08 - Gestionar catálogo  Abrir `/perfil.html` y crear/editar/eliminar un barbero o servicio  Los cambios se reflejan en la base de datos  Pendiente validación manual 
 TC-09 - Verificar responsive  Probar la aplicación en móvil y escritorio  La navegación y formularios mantienen una experiencia usable  Pendiente validación manual 
 TC-10 - Compilar proyecto  Ejecutar `npm run build`  La compilación termina sin errores  Verificado localmente 

## Limitaciones y observaciones

- El proyecto no incluye un script SQL ni una guía completa de esquema para la base de datos
- La configuración de Supabase está acoplada al código y requiere ajustes manuales para reutilizar el proyecto en otro entorno
- No existen cuentas de prueba públicas ni credenciales de administrador documentadas en el repositorio
- La gestión del panel está protegida por una sola cuenta administrativa, por lo que la configuración del correo autorizado debe hacerse con cuidado
- El repositorio no incluye un backend/API propio; cualquier persistencia depende de la base de datos y autenticación gestionadas por Supabase.

## Verificación final

Se ejecutó la validación de compilación del proyecto con:


npm run build


## Datos para iniciar sesion en acceso personal 
Correo:menorcuartas@gmail.com
Contraseña:123456