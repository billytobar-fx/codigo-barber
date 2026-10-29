# Código Barber

Código Barber es una aplicación web para consultar servicios, perfiles de barberos y reservar citas en una barbería. La solución combina una interfaz pública para clientes con un panel administrativo para gestionar citas, servicios y barberos. La aplicación está desplegada en Vercel y usa Supabase para autenticación y almacenamiento de datos.

URL pública: https://codigo-barber.vercel.app/

## 1. Descripción del proyecto

La app está orientada a resolver la necesidad de una barbería de permitir reservas en línea, mostrar su catálogo y mantener una gestión ordenada de las citas. El proyecto está pensado tanto para clientes como para el personal autorizado.

### Público objetivo
- Clientes que desean consultar servicios y reservar una cita.
- Dueño o personal administrativo que gestiona citas y catálogo del negocio.

### Beneficios
- Consulta rápida de servicios, precios y tiempos estimados.
- Visualización de barberos, especialidades y experiencia.
- Proceso de reserva guiado paso a paso.
- Validación de teléfonos colombianos y revisión de disponibilidad.
- Panel administrativo para consultar y cambiar el estado de las reservas.

### Alcance actual
- Funciones implementadas: landing page, catálogo, galería, reserva, autenticación administrativa y gestión de citas.
- Funciones parcialmente implementadas: gestión de horarios dentro del panel y configuración de base de datos.
- Funciones pendientes por documentar o validar: script SQL del esquema, usuarios de prueba y políticas reales de Supabase.

## 2. Funcionalidades implementadas

Se comprobó que el proyecto cuenta con estas funcionalidades en el código:

- Página principal con hero, servicios, barberos, galería y CTA de reserva.
- Flujo de reserva por pasos: servicio, barbero, fecha, hora y confirmación.
- Validación de número celular colombiano antes de guardar la reserva.
- Verificación de disponibilidad por barbero, fecha y hora.
- Recuperación de contraseña para el acceso administrativo.
- Login del panel con Supabase Auth.
- Dashboard general con conteo de citas por estado.
- Listado de reservas con filtros por fecha, barbero y búsqueda por cliente.
- Cambio de estado de citas (pendiente, atendida, cancelada).
- Gestión de servicios y barberos desde el perfil administrativo.
- Diseño responsive para escritorio y móvil.

### Limitaciones observadas
- La base de datos no está documentada con un script SQL reproducible dentro del repositorio.
- La autenticación y persistencia dependen de una instancia real de Supabase.
- La cuenta administrativa está restringida a una dirección específica configurada en el código.
- Los horarios de atención se muestran en la interfaz, pero su persistencia real debe validarse con la base de datos configurada.

## 3. Tecnologías utilizadas

| Tecnología | Versión declarada / comprobada | Función dentro del proyecto |
|---|---:|---|
| HTML5 | - | Estructura de las páginas |
| CSS3 | - | Estilos, layout y diseño responsive |
| JavaScript ES Modules | - | Lógica de la aplicación y manejo de DOM |
| Node.js | 20.19+ / 22.12+ (Vite 8) | Entorno de ejecución para desarrollo |
| npm | - | Instalación de dependencias |
| Vite | ^8.2.2 | Servidor de desarrollo y build de producción |
| SweetAlert2 | ^11.26.25 | Alertas y confirmaciones visuales |
| Supabase Auth | - | Inicio de sesión y recuperación de contraseña |
| Supabase JavaScript SDK | importado por CDN | Conexión con la base de datos y autenticación |
| PostgreSQL (Supabase) | gestionado por Supabase | Persistencia de reservas y catálogo |
| Vercel | - | Despliegue de la aplicación |

Nota: el cliente de Supabase se importa desde CDN en `src/js/supabase.js` y no aparece como dependencia directa en `package.json`.

## 4. Requisitos previos

- Sistema operativo compatible con Node.js y Vite (Windows, macOS o Linux).
- Node.js compatible con Vite 8.
- npm.
- Navegador web actualizado.
- Acceso a una instancia de Supabase configurada.
- Si se desea desplegar, acceso al proyecto de Vercel y a la configuración de la app.

## 5. Instalación paso a paso

1. Clona el repositorio o descarga el código fuente.
2. Abre la carpeta raíz del proyecto en una terminal.
3. Instala las dependencias:


npm install


4. Verifica que la configuración de Supabase en `src/js/supabase.js` coincida con tu proyecto real.
5. Si es necesario, crea o ajusta la base de datos y las tablas en Supabase.
6. Ejecuta la aplicación en modo desarrollo:


npm run dev


7. Abre la URL local indicada por Vite, normalmente:


http://localhost:5173/


8. Para compilar la versión de producción:


npm run build


9. Para previsualizar la compilación:


npm run preview


## 6. Variables de entorno

El proyecto no usa un archivo `.env` en su estado actual. La conexión a Supabase está escrita directamente en `src/js/supabase.js` con la URL y la clave pública del cliente.

Si el equipo decide migrarlo a variables de entorno, la estructura recomendada sería:


VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica


## 7. Ejecución de la aplicación

### Desarrollo local


- Puerto por defecto: `5173`
- URL esperada: `http://localhost:5173/`
- Si el puerto está ocupado, Vite suele asignar otro disponible y lo muestra en la terminal.

### Producción


npm run build
npm run preview


- El resultado final se genera en la carpeta `dist/`.
- La vista previa debe abrirse con la URL mostrada por Vite.

### Detener la ejecución
- En la terminal, presiona `Ctrl + C`.

## 8. Base de datos y persistencia

La aplicación no cuenta con un backend propio dentro del repositorio. La persistencia real se realiza mediante Supabase desde el navegador.

### Entidades observadas en el código

 Tabla / recurso | Uso observado |

 `citas` | registro, consulta, disponibilidad y cambio de estado |
 `barberos` | listado y administración |
 `servicios` | catálogo y precios |
 `clientes` | relación de reservas con datos del cliente |
 `auth` de Supabase | login, logout y recuperación de contraseña |

### Campos esperados por el código

- `barberos`: `id`, `nombre`, `especialidad`
- `servicios`: `id`, `nombre`, `duracion`, `precio`
- `citas`: `id`, `cliente_nombre`, `cliente_telefono`, `servicio`, `barbero`, `fecha`, `hora`, `estado`

### Importante
No existe un script SQL reproducible en el repositorio para crear el schema. Esto significa que el equipo debe configurar la base de datos real en Supabase con las tablas, columnas, relaciones y políticas necesarias para que la aplicación funcione correctamente.

## 9. Usuarios y datos de prueba

La aplicación no incluye credenciales públicas ni cuentas de prueba documentadas en el repositorio.

### Para la parte administrativa
- Debe existir una cuenta de Supabase autorizada para el correo configurado en `src/js/admin-auth.js`.
- Se recomienda usar una cuenta nueva y de prueba, no personal ni real.
- El acceso se controla por comparación con `ADMIN_EMAIL`.

### Para la parte pública
- Usar datos ficticios en la reserva.
- Probar con nombres, teléfonos y fechas simuladas.
- No publicar datos reales de clientes.

## 10. Guía de pruebas funcionales

| ID | Funcionalidad | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-01 | Consultar servicios | Abrir la página principal | Se muestran servicios con nombre, duración y precio | Pendiente validación manual |
| TC-02 | Ver barberos | Revisar la sección del equipo | Se visualizan los barberos y sus perfiles | Pendiente validación manual |
| TC-03 | Reservar cita | Completar formulario con datos ficticios | La reserva se confirma correctamente | Pendiente validación manual |
| TC-04 | Validar disponibilidad | Reservar el mismo horario dos veces | Se bloquea la segunda reserva | Pendiente validación manual |
| TC-05 | Validar teléfono | Ingresar un número inválido | Se muestra advertencia | Pendiente validación manual |
| TC-06 | Iniciar sesión administrativa | Ingresar con cuenta autorizada | Se redirige al dashboard | Pendiente validación manual |
| TC-07 | Gestionar reservas | Cambiar el estado de una cita | Se refleja en la tabla del panel | Pendiente validación manual |
| TC-08 | Administrar catálogo | Crear/editar/eliminar barbero o servicio | Los cambios se guardan en Supabase | Pendiente validación manual |
| TC-09 | Diseño responsive | Probar en móvil y desktop | La interfaz sigue siendo usable | Pendiente validación manual |
| TC-10 | Compilar proyecto | Ejecutar `npm run build` | La compilación termina sin errores | Verificado |

## 11. Estructura principal del proyecto

```text
codigo-barber/
├── index.html
├── login.html
├── dashboard.html
├── reservas.html
├── perfil.html
├── reset-password.html
├── package.json
├── package-lock.json
├── vite.config.js
├── vercel.json
├── README.md
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── main.js
│   ├── style.css
│   ├── css/
│   └── js/
│       ├── admin-auth.js
│       ├── alerts.js
│       ├── appointment-status.js
│       ├── booking.js
│       ├── dashboard.js
│       ├── login.js
│       ├── perfil.js
│       ├── phone-validation.js
│       ├── reservas.js
│       ├── reset-password.js
│       └── supabase.js
└── dist/   (generada por build)


## 12. Despliegue y publicación

La versión publicada está en:

https://codigo-barber.vercel.app/

La aplicación se despliega con Vercel y depende de una instancia configurada de Supabase. El repositorio no incluye credenciales de despliegue ni secretos.

## 13. Limitaciones y pendientes conocidos

- Falta un script SQL reproducible para crear el esquema completo de la base de datos.
- No hay documentación detallada de políticas RLS y relaciones reales de Supabase.
- No hay usuarios de prueba documentados ni entregados en el repositorio.
- La cuenta administrativa debe configurarse con cuidado para no exponer información sensible.
- El calendario/horarios debe verificarse con la estructura real de la base de datos.

## 14. Verificación realizada

Se ejecutó la validación del proyecto con:

npm run build




## 15. Repositorio y documentación

- Proyecto: Código Barber
- URL pública: https://codigo-barber.vercel.app/
- Repositorio GitHub: https://github.com/billytobar-fx/codigo-barber.git

