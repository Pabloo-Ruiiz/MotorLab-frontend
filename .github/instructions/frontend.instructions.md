---
applyTo: "**"
---
Estoy desarrollando el frontend de MotorLab: una SPA en Angular para un taller mecánico. Los clientes piden reparaciones y siguen su estado, la recepción (administrador) gestiona solicitudes y presupuestos, y los mecánicos actualizan los estados de las órdenes.

El frontend Angular tiene su propio repositorio, separado del backend Spring Boot; el proyecto Angular está en la raíz de ese repositorio y su código vive en src/app, src/styles y src/environments. Consume la API REST descrita en #file:docs/Motorlab_Api.md (referencia con tipos, endpoints, roles, errores y validaciones), generada a partir del OpenAPI del backend #file:docs/MotorLab-API.json. Si los dos documentos no coinciden, manda el JSON.

Stack: Angular (última versión estable) con componentes standalone, TypeScript en modo estricto, SCSS, signals, el nuevo control flow (@if, @for), formularios reactivos, HttpClient con interceptores funcionales y rutas con carga perezosa (loadComponent). Sin NgModules y sin librerías de componentes: los estilos son propios (tokens SCSS en src/styles).

Estructura de src/app: core (models, services, interceptors, guards, util), shared (components, pipes), layouts y features/<dominio> (auth, vehiculos, ordenes, presupuestos, notificaciones, perfil, taller/...). Alias de rutas: @core/*, @shared/*, @layouts/*, @features/*, @env/*.

Reglas que debes cumplir SIEMPRE:
1. Código, nombres y comentarios en castellano. Clases con sufijo: ...Component, ...Service, ...Guard, ...Pipe, y archivos *.component.ts, *.service.ts, etc. (si usas `ng generate`, añade --type para conservar el sufijo).
2. Componentes standalone con ChangeDetectionStrategy.OnPush, inject() en lugar de inyección por constructor, y plantilla (.html) y estilos (.scss) en archivos separados.
3. Las interfaces de TypeScript reflejan EXACTAMENTE el JSON de la API (propiedades y parámetros de consulta en camelCase, como tipoServicio o totalPaginas; los valores de los enumerados llevan guion bajo, como aceite_filtros). No se renombran ni se mapean. Los importes llegan como number y las fechas como string ISO.
4. Ningún componente usa HttpClient directamente: todas las peticiones van en servicios. La URL base es environment.apiUrl ("/api/v1").
5. El token JWT lo añade un interceptor y un 401 cierra la sesión y lleva a /login.
6. Los errores de la API tienen la forma {"error": {"codigo", "mensaje", "detalles": [{"campo", "mensaje"}]}}. Se muestran con mensajes claros y los de validación se asignan al campo del formulario (los controles de los formularios usan los mismos nombres camelCase que el JSON).
7. Diseño móvil primero en la zona del cliente y escritorio con barra lateral en la zona del taller. Usa los tokens y clases de src/styles. Accesibilidad: etiqueta en todos los campos, foco visible, contraste suficiente y botones de al menos 44 px en móvil.
8. Las pruebas se escriben con la sintaxis del runner que use el proyecto (míralo en package.json).
9. Antes de generar nada, lee #file:docs/Motorlab_Api.md y, para comprobar nombres y tipos, #file:docs/MotorLab-API.json. Si algo no está claro, pregúntame en lugar de inventarlo.
10. Nunca subas contraseñas, secretos o archivos .env al repositorio.

Cuando termines, dime qué archivos has creado o modificado.