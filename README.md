# MotorLab · Frontend

Aplicación web de una sola página (SPA) en Angular para la gestión de reparaciones de un taller mecánico. Los clientes solicitan reparaciones, autorizan presupuestos y siguen el estado de su vehículo. La administración gestiona solicitudes, presupuestos, piezas y usuarios, y los mecánicos actualizan el estado de las órdenes que tienen asignadas.

Este repositorio solo contiene el frontend. La API REST está en otro repositorio: [MotorLab-backend](https://github.com/Pabloo-Ruiiz/MotorLab-backend).

## Requisitos

- **Node.js LTS**, versión 22.22.3 o superior dentro de la 22, o 24.15 o superior. La integración continua usa Node 24.
- **Angular CLI 22**. Se instala con las dependencias del proyecto y `npm` lo usa desde ahí. Solo necesitas instalarlo de forma global si quieres escribir `ng` directamente:

  ```bash
  npm install -g @angular/cli
  ```

## Instalación

```bash
npm ci
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Arranca el servidor de desarrollo en http://localhost:4200, con el proxy hacia el backend. |
| `npm test` | Ejecuta las pruebas con Vitest y se queda observando los cambios. Para una sola ejecución: `npx ng test --watch=false`. |
| `npm run build` | Compila la aplicación en `dist/motorlab/browser`. Usa la configuración de producción, que es la predeterminada. |
| `npm run build:prod` | Compila indicando de forma explícita la configuración de producción. |

Para compilar el frontend y copiarlo al backend, de forma que Spring Boot lo sirva desde `src/main/resources/static`:

```bash
bash scripts/build-frontend.sh ../MotorLab-backend
```

## Proxy hacia el backend

En desarrollo, `npm start` usa [proxy.conf.json](proxy.conf.json): las peticiones a `/api` se reenvían a `http://localhost:8080`. El navegador solo habla con el puerto 4200, así que no hace falta configurar CORS para trabajar en local.

## Entornos

Los archivos están en [src/environments](src/environments) y solo definen la URL base de la API:

| Archivo | Se usa en | `apiUrl` |
|---|---|---|
| `environment.development.ts` | `npm start` y las compilaciones de desarrollo | `/api/v1` |
| `environment.ts` | Compilación de producción | `/api/v1` |

La URL es relativa en los dos casos: en desarrollo la resuelve el proxy y en producción el frontend se sirve desde el mismo origen que la API. Se importa con el alias `@env/environment`.

## Estructura de `src/app`

```text
src/app
├── core                 Código único de toda la aplicación
│   ├── guards           authGuard, rolGuard e invitadoGuard
│   ├── interceptors     Token JWT y tratamiento global de errores
│   ├── models           Interfaces de la API, tipos y etiquetas
│   ├── services         Un servicio por dominio de la API
│   └── util             Validadores, formularios, estados, foco y errores
├── shared               Piezas reutilizables, sin lógica de negocio
│   ├── components       Paginador, modal, avatar, visor de fotos, línea de tiempo…
│   ├── pipes            Importes en euros y fechas
│   └── util             Tonos de color por estado y urgencia
├── layouts              Estructura de cada zona
│   ├── cliente-layout   Pestañas inferiores en móvil, barra lateral en escritorio
│   └── taller-layout    Pestañas inferiores en móvil, barra lateral en escritorio
└── features             Pantallas, agrupadas por dominio
    ├── auth             Inicio de sesión y registro
    ├── vehiculos
    ├── ordenes
    ├── presupuestos
    ├── notificaciones
    ├── perfil           Compartido por clientes y personal del taller
    └── taller           Solicitudes, detalle de orden, presupuesto, piezas,
                         vista del mecánico, usuarios y panel
```

Los estilos globales y los tokens de diseño están en `src/styles`. Hay alias para importar sin rutas relativas largas: `@core/*`, `@shared/*`, `@layouts/*`, `@features/*` y `@env/*`.

## Pantallas

### Cliente (`/cliente`)

| Ruta | Pantalla |
|---|---|
| `/cliente/ordenes` | Mis órdenes y su seguimiento |
| `/cliente/ordenes/:id/presupuesto` | Presupuesto para autorizar o rechazar |
| `/cliente/solicitud/nueva` | Nueva solicitud de reparación |
| `/cliente/vehiculos` | Mis vehículos y su historial |
| `/cliente/avisos` | Avisos |
| `/cliente/perfil` | Perfil, foto y cierre de sesión |

### Administración (`/taller`)

| Ruta | Pantalla |
|---|---|
| `/taller/solicitudes` | Indicadores (nuevas, urgencia alta, pendientes de presupuesto, total) que filtran la tabla, búsqueda y filtros por estado, urgencia y mecánico |
| `/taller/ordenes/:id` | Resumen del vehículo, avería y cliente; asignación, cambio de estado, acciones y seguimiento |
| `/taller/ordenes/:id/presupuesto` | Desglose de líneas, condiciones del servicio, totales y envío al cliente |
| `/taller/piezas` | Inventario con búsqueda, filtros rápidos y acciones por pieza (entrada, editar, dar de baja) |
| `/taller/usuarios` | Directorio con avatar, rol y activación de cuentas |
| `/taller/panel` | Métricas del mes en curso y órdenes por estado |
| `/taller/avisos` | Avisos |

### Mecánico (`/taller`)

| Ruta | Pantalla |
|---|---|
| `/taller/mis-ordenes` | Órdenes asignadas en curso e historial de finalizadas |
| `/taller/mis-ordenes/:id` | Vehículo, diagnóstico, piezas con su stock, cambio de estado y seguimiento |
| `/taller/piezas` | Catálogo de piezas (solo consulta) |
| `/taller/avisos` | Avisos |
| `/taller/perfil` | Perfil, foto y cierre de sesión |

`/taller/perfil` está abierta a todo el personal del taller, pero solo aparece en el menú del mecánico.

## Diseño

La guía de diseño está en [docs/DESIGN.md](docs/DESIGN.md) y sus tokens, como variables CSS `--mo-*`, en [src/styles/_tokens.scss](src/styles/_tokens.scss). La paleta se basa en el crema `#F9F8F6`, el negro `#0D0D0D` y grises, con rojo, ámbar y verde solo para estados.

Clases reutilizables de [src/styles/_componentes.scss](src/styles/_componentes.scss) que comparten las pantallas:

| Clase | Uso |
|---|---|
| `.estado-orden` + `data-tono` | Etiqueta de estado o urgencia con punto. El tono (`informativo`, `exito`, `aviso`, `error`, `neutro`) sale de [tonos.ts](src/app/shared/util/tonos.ts) |
| `.bloque`, `.bloque__titulo`, `.bloque__acciones` | Tarjeta de sección con título en versalitas y pie de acciones |
| `.campos-suaves` | Campos de formulario con borde suave, misma altura y anillo de foco. Se aplica también dentro de `.bloque` y `.dialogo` |
| `.migas__lista`, `.migas__enlace` | Ruta de navegación de las pantallas de detalle |
| `.estado-orden--grande`, `.cabecera__numero` | Estado destacado y número de documento junto al título |
| `.ico`, `.ico--14`, `.ico--16` | Iconos SVG de trazo que toman el color del texto |
| `.dialogo`, `.dialogo__titulo`, `.dialogo__acciones` | Diálogos con cabecera separada, pie sobre crema y fondo desenfocado |

Cada pantalla muestra el logo de MotorLab como marca de agua fija en la esquina inferior derecha (`<app-logo class="filigrana" />`, con opacidad 0,035).

Componentes compartidos añadidos para el rediseño:

- **`app-avatar`**: foto de perfil circular. Sin foto, el administrador muestra el logo del taller y el resto, sus iniciales. El tamaño se ajusta con `--avatar-tamano`.
- **`app-visor-foto`**: muestra una foto de perfil en grande. Se cierra con la X, con Escape o pulsando fuera.

## Limitaciones conocidas

- **Fotos de perfil.** La API no las admite: [FotoPerfilService](src/app/core/services/foto-perfil.service.ts) las guarda en el `localStorage` del navegador. En el directorio de usuarios solo se ve la foto de quien la subió desde ese mismo navegador.
- **Búsqueda de usuarios.** `GET /usuarios` no filtra por texto, así que el buscador de `/taller/usuarios` filtra solo la página cargada.
- **Periodo del panel.** `GET /panel/metricas` devuelve siempre el mes en curso, así que el panel no permite elegir otro mes.

## Convenciones

- **Componentes standalone**, sin NgModules, con `ChangeDetectionStrategy.OnPush` e `inject()`. La plantilla y los estilos van en archivos separados, y las rutas se cargan con `loadComponent`.
- **Signals** para el estado de los componentes y de los servicios, y el control de flujo nuevo (`@if`, `@for`) en las plantillas.
- **Interfaces en camelCase, igual que el JSON de la API** (`tipoServicio`, `totalPaginas`). No se renombran ni se transforman. Los valores de los enumerados conservan su guion bajo (`aceite_filtros`), los importes son `number` y las fechas, `string` ISO.
- **Un servicio por dominio** en `core/services`. Ningún componente usa `HttpClient` directamente.
- El **token JWT** lo añade un interceptor, y un 401 cierra la sesión y lleva a `/login`.
- Los **errores de validación** de la API se asignan al campo correspondiente, porque los controles de los formularios se llaman igual que en el JSON.
- Código, nombres y comentarios en castellano.

La referencia de la API está en [docs/MotorLab_Api.md](docs/MotorLab_Api.md).

## Cómo arrancar todo

El backend y el frontend están en repositorios distintos y se arrancan cada uno en su terminal. Estos comandos son para **Git Bash en Windows**. Para el backend necesitas además **JDK 21** y **PostgreSQL 17 o superior**.

### 1. Clonar los dos repositorios

```bash
git clone https://github.com/Pabloo-Ruiiz/MotorLab-backend.git
git clone https://github.com/Pabloo-Ruiiz/MotorLab-frontend.git
```

### 2. Crear las bases de datos

Hazlo una sola vez, desde la carpeta `MotorLab-backend`, con PostgreSQL iniciado. Se crea el usuario `motorlab_usr` y dos bases de datos: `motorlabdb` para la aplicación y `motorlab_testdb` para las pruebas.

```bash
winpty psql -U postgres -d postgres -c "CREATE USER motorlab_usr;"

# Define la contraseña de motorlab_usr
winpty psql -U postgres -d postgres
# Dentro de psql:
#   \password motorlab_usr
#   \q

winpty psql -U postgres -d postgres -c "CREATE DATABASE motorlabdb OWNER motorlab_usr ENCODING 'UTF8' TEMPLATE template0;"
winpty psql -U postgres -d postgres -c "CREATE DATABASE motorlab_testdb OWNER motorlab_usr ENCODING 'UTF8' TEMPLATE template0;"
```

Después carga el esquema y los datos de demostración:

```bash
winpty psql -U motorlab_usr -d motorlabdb -f docs/motorlab_schema.sql
winpty psql -U motorlab_usr -d motorlab_testdb -f docs/motorlab_schema.sql
```

> **Atención:** el script recrea las tablas. Si lo vuelves a ejecutar, perderás los datos de esa base de datos.

### 3. Arrancar el backend

En una terminal, desde la carpeta `MotorLab-backend`. El archivo `application-local.properties` no se sube a git, así que la primera vez hay que crearlo:

```bash
echo 'app.dev.password-semilla=${DEV_PASSWORD_SEMILLA}' > src/main/resources/application-local.properties
```

Define las variables y arranca con el perfil `local`. Las variables solo duran mientras esté abierta esa terminal:

```bash
export DB_USER=motorlab_usr
export DB_PASS="<contraseña-de-motorlab_usr>"
export JWT_SECRET="$(openssl rand -base64 48)"
export SPRING_PROFILES_ACTIVE=local
export DEV_PASSWORD_SEMILLA="<contraseña-para-los-usuarios-de-ejemplo>"

./mvnw spring-boot:run
```

### 4. Arrancar el frontend

En otra terminal, desde la carpeta `MotorLab-frontend`:

```bash
npm ci
npm start
```

### 5. Entrar en la aplicación

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |

### Credenciales de desarrollo

| Rol | Correo | Pantalla inicial |
|---|---|---|
| Administrador | `admin@taller.example` | `/taller/solicitudes` |
| Mecánico | `javi@taller.example` | `/taller/mis-ordenes` |
| Cliente | `laura@cliente.example` | `/cliente/ordenes` |

Los tres usan la contraseña que pusiste en `DEV_PASSWORD_SEMILLA` la **primera vez** que arrancaste el backend con el perfil `local`. Una vez asignada, cambiar la variable no la modifica: para usar otra, vuelve a cargar el esquema en `motorlabdb`.
