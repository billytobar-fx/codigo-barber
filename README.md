Código Barber
Código Barber es una aplicación web para consultar servicios, conocer los perfiles de los barberos y reservar citas en una barbería. Incluye una interfaz pública para clientes y un panel administrativo para gestionar citas, servicios y barberos.
- Aplicación publicada: https://codigo-barber.vercel.app/
- Repositorio: https://github.com/billytobar-fx/codigo-barber.git
1. Descripción del proyecto
La aplicación busca facilitar las reservas en línea, mostrar el catálogo de servicios y ayudar a mantener organizadas las citas del negocio.
Público objetivo
- Clientes que desean consultar servicios y reservar una cita.
- Dueño o personal administrativo que gestiona citas y catálogo del negocio.
Beneficios principales
- Consulta de servicios, precios y duraciones estimadas.
- Visualización de barberos y sus especialidades.
- Proceso guiado para reservar una cita.
- Validación de números de celular colombianos.
- Comprobación de disponibilidad por barbero, fecha y hora.
- Panel administrativo para consultar y actualizar reservas.
Alcance y estado actual
- Funcionalidades comprobadas durante las pruebas: una reserva de prueba se confirmó y se guardó en Supabase; al intentar reservar nuevamente el mismo barbero, fecha y hora, la aplicación rechazó la segunda reserva.
- Pendiente de validar: el rechazo de teléfonos inválidos, el acceso administrativo, las operaciones de gestión de catálogo, la recuperación de contraseña, los horarios y el diseño en distintos tamaños de pantalla.
- Pendiente de documentar o revisar: un script SQL reproducible del esquema completo y una revisión integral de las políticas de seguridad de Supabase.
2. Funcionalidades
Las funcionalidades contempladas en el proyecto incluyen:
- Página principal con información, servicios, barberos, galería y acceso a reservas.
- Flujo de reserva por pasos: servicio, barbero, fecha, hora y datos del cliente.
- Validación del número celular antes de enviar una reserva.
- Comprobación de disponibilidad del barbero en una fecha y hora.
- Inicio de sesión administrativo con Supabase Auth.
- Recuperación de contraseña para el acceso administrativo.
- Panel con resumen de citas y listado de reservas.
- Filtros de reservas por fecha, barbero o búsqueda por cliente.
- Cambio de estado de las citas.
- Gestión de servicios y barberos desde el panel, según la configuración disponible.
- Diseño adaptable a escritorio y dispositivos móviles.
La disponibilidad y el comportamiento de cada función deben confirmarse con pruebas manuales en el entorno configurado.

3. Tecnologías utilizadas
Tecnología	Uso
HTML5	Estructura de las páginas
CSS3	Estilos y diseño adaptable
JavaScript ES Modules	Lógica de la aplicación
Node.js	Entorno de ejecución para desarrollo
npm	Instalación y ejecución de scripts
Vite	Servidor de desarrollo y compilación
SweetAlert2	Alertas y confirmaciones visuales
Supabase Auth	Autenticación administrativa
Supabase JavaScript SDK	Conexión con Supabase desde el navegador
PostgreSQL mediante Supabase	Persistencia de citas y catálogo
Vercel	Publicación de la aplicación


El cliente de Supabase se importa desde un CDN en src/js/supabase.js; por ello, puede no aparecer como dependencia directa en package.json. Consulta ese archivo para comprobar la configuración que utiliza el proyecto.
4. Requisitos previos
- Windows, macOS o Linux.
- Node.js compatible con la versión de Vite declarada en package.json.
- npm.
- Un navegador actualizado.
- Acceso a una instancia de Supabase configurada con las tablas y políticas requeridas.
- Para desplegar cambios, acceso al proyecto correspondiente en Vercel.
5. Instalación y ejecución local
1. Clona el repositorio o descarga el código fuente.
2. Abre una terminal en la carpeta raíz del proyecto.
3. Instala las dependencias:
   npm install
4. Revisa src/js/supabase.js y confirma que la URL y la clave pública correspondan a la instancia de Supabase que vas a utilizar. No publiques claves secretas ni credenciales administrativas.
5. Confirma que la base de datos tenga las tablas, columnas, relaciones y políticas necesarias.
6. Inicia el servidor de desarrollo:
   npm run dev
7. Abre en el navegador la dirección local que indique Vite. Normalmente es:
   http://localhost:5173/
Si el puerto está ocupado, Vite puede mostrar otra dirección en la terminal.
Compilar para producción
Ejecuta:
npm run build
El resultado se genera normalmente en dist/.
Previsualizar la compilación
Después de compilar, ejecuta:
npm run preview
Abre la dirección que muestre la terminal.
Detener el servidor
En la terminal donde se está ejecutando Vite, presiona Ctrl + C.
6. Configuración de Supabase
La aplicación utiliza Supabase desde el navegador para autenticación y acceso a los datos. En la configuración actual, la conexión se encuentra en src/js/supabase.js.

El proyecto debe disponer, como mínimo, de las tablas que usa la aplicación:
- citas
- barberos
- servicios
- clientes
- horarios
Supabase Auth se utiliza para el acceso administrativo.
Variables de entorno
En el estado documentado del proyecto, la conexión se configura directamente en src/js/supabase.js y no mediante un archivo .env. Si posteriormente se migra a variables de entorno de Vite, un ejemplo de nombres sería:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
Estos nombres son un ejemplo de configuración futura; no significa que la aplicación ya los lea. En aplicaciones de navegador solo debe utilizarse la clave pública diseñada para el cliente, con políticas RLS adecuadas. Nunca incluyas una service_role key ni otra clave secreta en el código del frontend.
7. Esquema de datos conocido
Las tablas identificadas en Supabase incluyen:
Tabla	Uso
citas	Registro y consulta de reservas, disponibilidad y estado
barberos	Información de los barberos
servicios	Catálogo de servicios
clientes	Datos de clientes, según el esquema configurado
horarios	Días y horarios de atención


Columnas observadas en citas
La consulta de estructura realizada en Supabase mostró estas columnas:
- id
- cliente
- cliente_id
- nombre
- telefono
- servicio
- servicio_id
- barbero
- barbero_id
- fecha
- hora
- estado
- created_at
En src/js/booking.js, el flujo de reserva utiliza nombre, telefono, servicio, barbero, fecha y hora al insertar una cita. El código fue ajustado para usar nombre y telefono, que son columnas existentes en la tabla consultada.

La estructura completa, las restricciones, las relaciones y la compatibilidad con todos los módulos deben revisarse antes de recrear la base de datos desde cero. Aún se debe preparar y validar un script SQL reproducible que represente el esquema real.
8. Seguridad y políticas RLS
RLS (Row Level Security) permite controlar qué registros puede consultar o modificar cada rol. Se observó que RLS está habilitado en las cinco tablas principales, pero habilitarlo por sí solo no garantiza que las políticas sean seguras.

Durante la revisión de políticas se encontraron reglas permisivas de acceso amplio en algunas tablas, incluidas políticas ALL para roles anon y authenticated con condiciones verdaderas. Estas reglas requieren una revisión cuidadosa, porque podrían permitir operaciones más amplias de lo previsto.

Antes de considerar la seguridad validada:
1. Revisar todas las políticas RLS y los privilegios de tabla.
2. Definir qué operaciones debe poder realizar un visitante, un cliente y un administrador.
3. Asegurar que los clientes puedan crear reservas solo con los datos y las condiciones permitidos.
4. Restringir la lectura, actualización y eliminación de datos personales y citas.
5. Probar los permisos con sesiones anónimas y autenticadas.
6. Evitar cambios en producción sin verificar antes el efecto sobre las funciones existentes.
La revisión de seguridad sigue pendiente; este README no afirma que las políticas actuales estén completamente protegidas. Consulta también docs/seguridad-rls.md, si ese archivo está presente en el repositorio.
9. Usuarios y datos de prueba
El repositorio no documenta credenciales públicas de prueba.

Para validar el panel administrativo:
- Utiliza una cuenta de prueba autorizada en Supabase.
- Revisa src/js/admin-auth.js para comprobar las condiciones de acceso que aplica el código.
- No publiques contraseñas, tokens ni datos personales.
- Utiliza nombres y teléfonos ficticios para las pruebas de reserva.
10. Guía de pruebas funcionales
Los estados de esta tabla reflejan únicamente las pruebas realizadas y reportadas durante la revisión. Las pruebas no ejecutadas deben permanecer pendientes.
ID	Funcionalidad	Pasos resumidos	Resultado esperado	Estado
TC-01	Consultar servicios	Abrir la página principal	Se muestran los servicios disponibles	Pendiente de validar
TC-02	Ver barberos	Revisar la sección del equipo	Se muestran los perfiles disponibles	Pendiente de validar
TC-03	Reservar cita	Completar el formulario con datos de prueba	La cita se confirma y se guarda en Supabase	Verificado
TC-04	Comprobar disponibilidad	Intentar reservar el mismo barbero, fecha y hora dos veces	La segunda reserva se rechaza	Verificado
TC-05	Validar teléfono	Introducir un teléfono inválido	Se muestra una advertencia y no se guarda la reserva	Pendiente de validar
TC-06	Iniciar sesión administrativa	Entrar con una cuenta autorizada	Se permite el acceso al panel	Pendiente de validar
TC-07	Gestionar reservas	Cambiar el estado de una cita	El cambio se refleja y persiste	Pendiente de validar
TC-08	Administrar catálogo	Crear o editar un servicio o barbero	Los cambios se guardan correctamente	Pendiente de validar
TC-09	Diseño adaptable	Probar en escritorio y móvil	La interfaz se puede utilizar en ambos	Pendiente de validar
TC-10	Compilar proyecto	Ejecutar npm run build	La compilación finaliza sin errores	Marcado previamente como verificado; volver a ejecutar antes de entregar


11. Estructura principal del proyecto
La estructura observada/documentada es similar a la siguiente; los archivos exactos pueden variar según la versión del repositorio:
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
├── docs/
│   ├── esquema-supabase.md
│   └── seguridad-rls.md
├── public/
│   ├── favicon.svg
│   └── images/
└── src/
    ├── main.js
    ├── style.css
    ├── css/
    └── js/
        ├── admin-auth.js
        ├── alerts.js
        ├── appointment-status.js
        ├── booking.js
        ├── dashboard.js
        ├── login.js
        ├── perfil.js
        ├── phone-validation.js
        ├── reservas.js
        ├── reset-password.js
        └── supabase.js
12. Despliegue
La versión publicada está disponible en:

https://codigo-barber.vercel.app/

El proyecto utiliza Vercel para publicar la aplicación y Supabase para autenticación y persistencia. Para publicar cambios, confirma primero que la compilación termine correctamente y que la configuración de Supabase corresponda al entorno de destino.
13. Limitaciones y pendientes conocidos
- Preparar y validar un script SQL reproducible del esquema completo.
- Revisar las relaciones, restricciones y tipos de datos de las tablas.
- Revisar y probar todas las políticas RLS y los privilegios de tabla.
- Validar las operaciones administrativas y la recuperación de contraseña.
- Comprobar la gestión y persistencia de los horarios.
- Completar las pruebas funcionales pendientes.
- Verificar el comportamiento de la aplicación después de cualquier cambio de configuración.
14. Verificación de compilación
Para verificar que el proyecto compila, ejecuta:
npm run build
La compilación debe finalizar sin errores. Antes de entregar, ejecuta el comando en la versión final del código y registra el resultado real; no se debe marcar como aprobado si no se ha comprobado.
15. Enlaces del proyecto
- Aplicación publicada: https://codigo-barber.vercel.app/
- Repositorio GitHub: https://github.com/billytobar-fx/codigo-barber.git

