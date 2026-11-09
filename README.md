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
│   ├── components       Paginador, modal, pills, toasts, línea de tiempo…
│   └── pipes            Importes en euros y fechas
├── layouts              Estructura de cada zona
│   ├── cliente-layout   Móvil primero, con pestañas inferiores
│   └── taller-layout    Escritorio, con barra lateral
└── features             Pantallas, agrupadas por dominio
    ├── auth             Inicio de sesión y registro
    ├── vehiculos
    ├── ordenes
    ├── presupuestos
    ├── notificaciones
    ├── perfil
    └── taller           Solicitudes, detalle de orden, presupuesto, piezas,
                         vista del mecánico, usuarios y panel
```

Los estilos globales y los tokens de diseño están en `src/styles`. Hay alias para importar sin rutas relativas largas: `@core/*`, `@shared/*`, `@layouts/*`, `@features/*` y `@env/*`.

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
