# MotorLab · Referencia de la API para el frontend (v1.2)

Esta es la referencia **definitiva** de la API que consume el frontend Angular. Sustituye a `api_referencia_frontend.md` y a `motorlab_api.md`. Está alineada con el OpenAPI que genera el backend (`MotorLab-API.json`, OpenAPI 3.1, 39 operaciones, 36 esquemas). Si algo de este documento y el JSON no coinciden, **manda el JSON**.

Archivos en el repositorio del frontend (es un repositorio independiente del backend; el proyecto Angular está en su **raíz**):

- `docs/Motorlab_Api.md` (este documento). Los prompts lo leen con `#file:docs/Motorlab_Api.md`.
- `docs/MotorLab-API.json` (el OpenAPI descargado del backend). Los prompts lo leen con `#file:docs/MotorLab-API.json`.

Para volver a descargar el JSON con el backend arrancado: `curl http://localhost:8080/v3/api-docs -o docs/MotorLab-API.json`.

> **Cambio importante respecto a v1.1:** el JSON usa **`camelCase`** en propiedades y en parámetros de consulta (`totalPaginas`, `tipoServicio`, `mecanicoId`, `soloActivas`, `stockBajo`). Las versiones anteriores de la documentación decían `snake_case`. Los valores de los enumerados siguen en minúscula con guion bajo (`aceite_filtros`, `mano_obra`).

---

## 1. Convenciones

| Aspecto | Valor |
|---|---|
| URL base | `/api/v1` (en desarrollo, el proxy de Angular la redirige a `http://localhost:8080`) |
| Formato | JSON, **propiedades en `camelCase`** |
| Autenticación | `Authorization: Bearer <token>` (esquema `bearerAuth`, JWT); el token caduca a las 8 horas |
| Importes | `number` (por ejemplo `256.52`), siempre calculados por el servidor |
| Fechas | `format: date` = `"2026-10-12"`; `format: date-time` = `"2026-10-12T09:14:00"` (sin zona horaria) |
| Paginación | `?pagina=1&limite=20` (**la página empieza en 1**, `limite` entre 1 y 100, por defecto 20) |
| Roles | `cliente`, `mecanico`, `admin` |
| Identificadores | `id` y `{id}` enteros mayores que 0 |

**Nota sobre los campos opcionales del JSON.** El generador del OpenAPI marca casi todas las propiedades de las respuestas como no obligatorias. En la práctica el servidor siempre las envía (con `null` cuando no hay valor). Por eso los tipos de abajo declaran como `T | null` solo las que pueden venir vacías.

### Respuesta paginada

```ts
interface Pagina<T> {
  datos: T[];
  pagina: number;        // empieza en 1
  limite: number;
  total: number;
  totalPaginas: number;
}
```

### Respuestas que no son objetos

| Endpoint | Respuesta |
|---|---|
| `GET /notificaciones/contador` | un número entero (`int64`), por ejemplo `3` (**no** es un objeto) |
| `POST /notificaciones/marcar-todas` | un número entero (`int32`) con las notificaciones marcadas |

Angular las recibe con `http.get<number>(...)` y `http.post<number>(...)`.

### Error (respuestas 4xx y 5xx)

El JSON solo documenta las descripciones de los errores (401, 403, 404, 409), no el cuerpo. El formato es el definido al implementar el backend:

```ts
interface ApiErrorBody {
  error: {
    codigo: string;
    mensaje: string;
    detalles?: { campo: string; mensaje: string }[] | null;
  };
}
```

| Código HTTP | `codigo` | Cuándo |
|---|---|---|
| 400 | `VALIDACION` | Datos no válidos. `detalles` trae un elemento por campo (`campo` con el nombre de la propiedad en `camelCase`) |
| 401 | `NO_AUTENTICADO` | Falta el token, ha caducado o las credenciales son incorrectas (`mensaje`: «Credenciales incorrectas») |
| 403 | `SIN_PERMISO` | El rol no puede hacer esa acción |
| 404 | `NO_ENCONTRADO` | No existe **o no es del usuario** (no se revela cuál de las dos) |
| 409 | `EMAIL_DUPLICADO` | Email ya registrado |
| 409 | `MATRICULA_DUPLICADA` | Matrícula ya registrada |
| 409 | `TRANSICION_NO_PERMITIDA` | Cambio de estado no válido, o presupuesto que no está pendiente de respuesta |
| 409 | `STOCK_INSUFICIENTE` | Falta stock; `detalles` trae un elemento por pieza (`campo` = referencia, `mensaje` = «Stock 1, necesarias 2») |
| 409 | `PRESUPUESTO_NO_EDITABLE` | El presupuesto ya no está en borrador |
| 409 | `PRESUPUESTO_YA_EXISTE` | La orden ya tiene presupuesto |
| 409 | `CONFLICTO` | Otro conflicto (vehículo con órdenes abiertas, referencia de pieza repetida, pieza usada en presupuestos) |
| 409 | `CONFLICTO` | También: presupuesto que ya está pagado |
| 400 | `FIRMA_NO_VALIDA` | Aviso de Stripe sin firma válida (solo lo recibe Stripe, no el frontend) |
| 429 | `DEMASIADOS_INTENTOS` | Solo si se activa el límite de intentos de login |
| 503 | `PAGOS_NO_DISPONIBLES` | El pago en línea no está configurado o Stripe no responde |
| 500 | código genérico | Error del servidor («Error interno del servidor») |

> **Comprobación recomendada (paso F02):** el cuerpo de error no sale en el JSON. Provoca uno (login con contraseña mala) y mira si llega `error.codigo`. Si el backend devolviera otro formato, ajusta `ApiErrorBody`.

---

## 2. Tipos (espejo del JSON)

Cada interfaz indica el esquema del OpenAPI del que viene (`// OpenAPI: …`). Los nombres cortos son los que usa el frontend.

```ts
// ---- Enumerados (valores en minúscula, idénticos a la base de datos)
type Rol = 'cliente' | 'mecanico' | 'admin';
type TipoServicio = 'frenos' | 'motor' | 'aceite_filtros' | 'neumaticos' | 'electricidad' | 'itv' | 'otro';
type CuandoOcurre = 'al_frenar' | 'al_arrancar' | 'en_marcha' | 'siempre' | 'otro';
type ConduccionSegura = 'si' | 'no' | 'no_se';
type Urgencia = 'baja' | 'media' | 'alta';
type FranjaPreferida = 'manana' | 'tarde';
type ContactoPreferido = 'telefono' | 'email';
type EstadoOrden =
  | 'solicitud_recibida' | 'pendiente_presupuesto' | 'presupuesto_enviado' | 'presupuesto_autorizado'
  | 'recibido' | 'en_preparacion' | 'esperando_pieza' | 'arreglando' | 'listo' | 'entregado'
  | 'rechazada' | 'cancelada';
type EstadoPresupuesto = 'borrador' | 'enviado' | 'autorizado' | 'rechazado';
type TipoLinea = 'pieza' | 'mano_obra';
type TipoNotificacion = 'solicitud_nueva' | 'presupuesto_listo' | 'presupuesto_respondido' | 'cambio_estado' | 'vehiculo_listo';

// ---- Usuarios y autenticación
interface Usuario { id: number; nombre: string; email: string; telefono: string; rol: Rol; activo: boolean; } // OpenAPI: UsuarioResponse
interface UsuarioResumen { id: number; nombre: string; telefono: string; }                                    // OpenAPI: UsuarioResumenResponse
interface RegistroRequest { nombre: string; email: string; telefono: string; password: string; aceptaPrivacidad: boolean; }
interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; usuario: Usuario; }
interface UsuarioCreateRequest { nombre: string; email: string; telefono: string; password: string; rol: Rol; }
interface UsuarioUpdateRequest { rol?: Rol; activo?: boolean; }

// ---- Vehículos
interface Vehiculo {                                                                                           // OpenAPI: VehiculoResponse
  id: number; usuarioId: number; matricula: string; marca: string; modelo: string;
  version: string | null; anio: number; kilometros: number; activo: boolean;
}
interface VehiculoRequest {
  matricula: string; marca: string; modelo: string; version?: string | null;
  anio: number; kilometros: number; usuarioId?: number; // usuarioId solo lo usa un administrador
}

// ---- Órdenes
interface OrdenCreateRequest {
  vehiculoId: number; tipoServicio: TipoServicio; sintoma: string; cuandoOcurre?: CuandoOcurre | null;
  conduccionSegura: ConduccionSegura; urgencia: Urgencia; fechaPreferida: string; // date
  franjaPreferida: FranjaPreferida; contactoPreferido: ContactoPreferido; aceptaPrivacidad: boolean;
}
interface OrdenCreateResponse { id: number; estado: EstadoOrden; urgencia: Urgencia; mensaje: string; }
interface OrdenResumen {                                                                                       // OpenAPI: OrdenResumenResponse
  ordenId: number; estado: EstadoOrden; progreso: number; urgencia: Urgencia; tipoServicio: TipoServicio;
  matricula: string; marca: string; modelo: string; clienteNombre: string; mecanicoNombre: string | null;
  elevador: string | null; fechaEntrada: string | null; fechaEstimada: string | null; // date-time
  presupuestoEstado: EstadoPresupuesto | null; presupuestoTotal: number | null;
}
interface PresupuestoResumen { id: number; estado: EstadoPresupuesto; total: number; }                         // OpenAPI: PresupuestoResumenResponse
interface OrdenDetalle {                                                                                       // OpenAPI: OrdenDetalleResponse
  id: number; estado: EstadoOrden; progreso: number; urgencia: Urgencia; tipoServicio: TipoServicio;
  sintoma: string; cuandoOcurre: CuandoOcurre | null; conduccionSegura: ConduccionSegura;
  fechaPreferida: string; franjaPreferida: FranjaPreferida; contactoPreferido: ContactoPreferido;
  elevador: string | null; fechaEntrada: string | null; fechaEstimada: string | null;
  vehiculo: Vehiculo; cliente: UsuarioResumen; mecanico: UsuarioResumen | null; presupuesto: PresupuestoResumen | null;
}
interface AsignacionRequest { mecanicoId: number; elevador?: string | null; fechaEstimada?: string | null; } // date-time
interface CambioEstadoRequest { estado: EstadoOrden; descripcion?: string | null; }
interface EventoSeguimiento { estado: EstadoOrden; descripcion: string | null; fechaHora: string; }          // OpenAPI: EventoResponse
interface Seguimiento {                                                                                        // OpenAPI: SeguimientoResponse
  ordenId: number; vehiculo: string; // «Seat León 1.5 TSI · 4821KLB»
  estado: EstadoOrden; progreso: number; listoEstimado: string | null; eventos: EventoSeguimiento[];
}

// ---- Presupuestos
interface Linea {                                                                                              // OpenAPI: LineaResponse
  id: number; tipo: TipoLinea; piezaId: number | null; referencia: string | null;
  concepto: string; cantidad: number; precioUnitario: number; importe: number;
}
interface Totales { subtotal: number; ivaPorcentaje: number; iva: number; total: number; }                    // OpenAPI: TotalesResponse
interface AvisoStock { piezaId: number; referencia: string; stock: number; necesarias: number; }              // OpenAPI: AvisoStockResponse
interface Presupuesto {                                                                                        // OpenAPI: PresupuestoResponse
  id: number; ordenId: number; estado: EstadoPresupuesto; lineas: Linea[];
  subtotal: number; ivaPorcentaje: number; iva: number; total: number;
  tiempoEstimadoHoras: number | null; garantiaMeses: number; motivoRechazo: string | null;
  enviadoEn: string | null; respondidoEn: string | null;
  pagadoEn: string | null; // lo fija el aviso de Stripe al confirmar el cobro
  avisosStock: AvisoStock[]; // solo se rellena para admin y mecánico
}
interface SesionPago { url: string; }                                                                          // OpenAPI: SesionPagoResponse
interface LineaRequest { tipo: TipoLinea; piezaId?: number; concepto?: string; cantidad: number; precioUnitario?: number; }
interface LineaCreada { linea: Linea; totales: Totales; avisoStock: AvisoStock | null; }                      // OpenAPI: LineaCreadaResponse
interface PresupuestoUpdateRequest { tiempoEstimadoHoras?: number | null; garantiaMeses?: number | null; }
interface RechazoRequest { motivo?: string | null; }

// ---- Piezas
interface Pieza { id: number; referencia: string; nombre: string; precio: number; stock: number; activa: boolean; stockBajo: boolean; } // OpenAPI: PiezaResponse
interface PiezaRequest { referencia: string; nombre: string; precio: number; stock?: number; }
interface StockDeltaRequest { delta: number; motivo?: string | null; }

// ---- Notificaciones y panel
interface Notificacion { id: number; tipo: TipoNotificacion; mensaje: string; ordenId: number | null; leida: boolean; creadaEn: string; } // OpenAPI: NotificacionResponse
interface Metricas {                                                                                           // OpenAPI: MetricasResponse
  ordenesActivas: number;
  ordenesPorEstado: Partial<Record<EstadoOrden, number>>;
  ingresosMes: number;
  presupuestosSinRespuesta: number;
  piezasStockBajo: number;
}
```

---

## 3. Endpoints por recurso

Leyenda de roles: **C** = cliente, **M** = mecánico, **A** = administrador. Todos los endpoints llevan `Bearer` salvo `auth/registro`, `auth/login`, `auth/verificar-email` y `auth/reenviar-verificacion`.

### Autenticación

| Método y ruta | Roles | Cuerpo | Respuesta |
|---|---|---|---|
| `POST /auth/registro` | público | `RegistroRequest` | 201 `Usuario` |
| `POST /auth/login` | público | `LoginRequest` | 200 `LoginResponse` (403 `EMAIL_NO_VERIFICADO` si falta confirmar el correo) |
| `POST /auth/verificar-email` | público | `VerificarEmailRequest` | 204 (400 `TOKEN_INVALIDO`) |
| `POST /auth/reenviar-verificacion` | público | `ReenviarVerificacionRequest` | 204 siempre |
| `GET /auth/yo` | todos | — | 200 `Usuario` |

### Vehículos

| Método y ruta | Roles | Cuerpo | Respuesta |
|---|---|---|---|
| `GET /vehiculos?pagina&limite` | C (los suyos), A (todos) | — | `Pagina<Vehiculo>` |
| `POST /vehiculos` | C, A | `VehiculoRequest` | 201 `Vehiculo` (409 matrícula repetida) |
| `GET /vehiculos/{id}` | propietario, A | — | `Vehiculo` |
| `PUT /vehiculos/{id}` | propietario, A | `VehiculoRequest` (la matrícula no se cambia) | `Vehiculo` |
| `DELETE /vehiculos/{id}` | propietario, A | — | 204 (baja lógica; 409 si tiene órdenes abiertas) |
| `GET /vehiculos/{id}/historial?pagina&limite` | propietario, A | — | `Pagina<OrdenResumen>` |

### Órdenes

| Método y ruta | Roles | Cuerpo | Respuesta |
|---|---|---|---|
| `POST /ordenes` | C, A | `OrdenCreateRequest` | 201 `OrdenCreateResponse` |
| `GET /ordenes?estado&urgencia&mecanicoId&q&pagina&limite` | C (las suyas), M (las asignadas), A (todas) | — | `Pagina<OrdenResumen>` (`q` busca por matrícula o nombre del cliente, máx. 120 caracteres) |
| `GET /ordenes/{id}` | C (suya), M (asignada), A | — | `OrdenDetalle` |
| `PATCH /ordenes/{id}/asignacion` | A | `AsignacionRequest` | `OrdenDetalle` |
| `PATCH /ordenes/{id}/estado` | A, M | `CambioEstadoRequest` | `OrdenDetalle` |
| `POST /ordenes/{id}/cancelar` | C (suya), A | — | `OrdenDetalle` |
| `GET /ordenes/{id}/seguimiento` | C (suya), M (asignada), A | — | `Seguimiento` |

### Presupuestos

| Método y ruta | Roles | Cuerpo | Respuesta |
|---|---|---|---|
| `POST /ordenes/{ordenId}/presupuesto` | A | — | `Presupuesto` (en `borrador`; 409 si ya existe) |
| `GET /ordenes/{ordenId}/presupuesto` | A, M (asignada), C (suya, solo si no es borrador) | — | `Presupuesto` (404 si todavía no hay) |
| `PATCH /presupuestos/{id}` | A | `PresupuestoUpdateRequest` | `Presupuesto` |
| `POST /presupuestos/{id}/lineas` | A | `LineaRequest` | `LineaCreada` |
| `PUT /presupuestos/{id}/lineas/{lineaId}` | A | `LineaRequest` | `LineaCreada` |
| `DELETE /presupuestos/{id}/lineas/{lineaId}` | A | — | `Totales` |
| `POST /presupuestos/{id}/enviar` | A | — | `Presupuesto` |
| `POST /presupuestos/{id}/autorizar` | C (propietario) | — | `Presupuesto` |
| `POST /presupuestos/{id}/rechazar` | C (propietario) | `RechazoRequest` | `Presupuesto` |
| `POST /presupuestos/{id}/pago` | C (propietario) | — | `SesionPago` (409 si no está `autorizado` o ya está pagado; 503 si no hay pagos) |
| `POST /presupuestos/{id}/pago/efectivo` | C (propietario) | — | 204: pagará en efectivo al recoger (`estadoPago = pendiente_efectivo`); 409 si no está `autorizado` o ya está pagado |
| `POST /presupuestos/{id}/cobro-efectivo` | A | — | 204: cobrado en efectivo (`estadoPago = pagado_efectivo`); 409 igual que el anterior |
| `POST /pagos/stripe/webhook` | público, firmado por Stripe | evento de Stripe | 200 sin cuerpo (no lo llama el frontend) |

**Pago con Stripe.** El frontend redirige a `SesionPago.url` y Stripe devuelve al cliente a `/cliente/ordenes/{ordenId}/presupuesto?pago=ok` (o `?pago=cancelado`). Volver con `?pago=ok` no prueba nada: el presupuesto solo cuenta como pagado cuando `pagadoEn` deja de ser `null`, porque lo fija el webhook tras verificar la firma de Stripe. El importe lo calcula siempre el backend.

### Piezas

| Método y ruta | Roles | Cuerpo | Respuesta |
|---|---|---|---|
| `GET /piezas?q&soloActivas&stockBajo&pagina&limite` | M, A | — | `Pagina<Pieza>` (`soloActivas` por defecto `true`, `stockBajo` por defecto `false`, `q` máx. 120) |
| `POST /piezas` | A | `PiezaRequest` | `Pieza` (409 referencia repetida) |
| `GET /piezas/{id}` | M, A | — | `Pieza` |
| `PUT /piezas/{id}` | A | `PiezaRequest` (no cambia el stock) | `Pieza` |
| `DELETE /piezas/{id}` | A | — | 204 (baja lógica; 409 si aparece en presupuestos) |
| `PATCH /piezas/{id}/stock` | A | `StockDeltaRequest` | `Pieza` (409 si quedaría negativo) |

### Notificaciones

| Método y ruta | Roles | Cuerpo | Respuesta |
|---|---|---|---|
| `GET /notificaciones?leida&pagina&limite` | todos | — | `Pagina<Notificacion>` (de la más nueva a la más antigua) |
| `PATCH /notificaciones/{id}/leida` | propietario | — | `Notificacion` |
| `POST /notificaciones/marcar-todas` | todos | — | `number` (cuántas se han marcado) |
| `GET /notificaciones/contador` | todos | — | `number` (las no leídas) |

### Usuarios y panel (solo administrador)

| Método y ruta | Cuerpo | Respuesta |
|---|---|---|
| `GET /usuarios?rol&pagina&limite` | — | `Pagina<Usuario>` |
| `POST /usuarios` | `UsuarioCreateRequest` | `Usuario` (409 email repetido) |
| `PATCH /usuarios/{id}` | `UsuarioUpdateRequest` | `Usuario` (un administrador no puede desactivarse ni cambiarse el rol a sí mismo) |
| `GET /panel/metricas` | — | `Metricas` |

**Regla práctica:** después de añadir, modificar o eliminar una línea, vuelve a pedir `GET /ordenes/{ordenId}/presupuesto`. Así la pantalla siempre muestra lo que calculan los triggers de la base de datos.

---

## 4. Máquina de estados de una orden

| Desde | Hacia | Quién | Cómo |
|---|---|---|---|
| `solicitud_recibida` | `pendiente_presupuesto` | A | `PATCH /estado` (o automático al crear el presupuesto) |
| `pendiente_presupuesto` | `presupuesto_enviado` | A | automático con `POST /presupuestos/{id}/enviar` |
| `presupuesto_enviado` | `presupuesto_autorizado` / `rechazada` | C | automático con `/autorizar` o `/rechazar` |
| `presupuesto_autorizado` | `recibido` | A | `PATCH /estado` |
| `recibido` | `en_preparacion` | A, M | `PATCH /estado` |
| `en_preparacion` | `esperando_pieza` o `arreglando` | A, M | `PATCH /estado` |
| `esperando_pieza` | `arreglando` | A, M | `PATCH /estado` |
| `arreglando` | `esperando_pieza` o `listo` | A, M | `PATCH /estado` |
| `listo` | `entregado` | A | `PATCH /estado` |
| antes de `recibido` | `cancelada` | C (hasta `presupuesto_enviado`), A (hasta `presupuesto_autorizado`) | `POST /cancelar` |

- `PATCH /estado` **rechaza** los estados automáticos (`presupuesto_enviado`, `presupuesto_autorizado`, `rechazada`, `cancelada`).
- El mecánico solo puede usar `en_preparacion`, `esperando_pieza`, `arreglando` y `listo`, y solo en órdenes asignadas a él (si no, 403).
- Al pasar a `arreglando` **por primera vez** se descuenta el stock; si falta, 409 `STOCK_INSUFICIENTE` y el estado no cambia.
- Progreso: `recibido` 20, `en_preparacion` 40, `esperando_pieza` 60, `arreglando` 80, `listo` y `entregado` 100, el resto 0.
- Estados **finales**: `entregado`, `rechazada`, `cancelada`. «Activas» = todas las demás.

---

## 5. Validaciones que el formulario debe replicar

El servidor siempre valida; el frontend replica las reglas para avisar antes y mostrar el error junto al campo.

| Formulario | Reglas |
|---|---|
| Registro | `nombre` obligatorio, máx. 100; `email` válido, máx. 150; `telefono` obligatorio, patrón `^[0-9 +]{9,20}$`; `password` entre 8 y 72; `aceptaPrivacidad` marcada |
| Login | `email` (válido) y `password` obligatorios |
| Vehículo | `matricula` obligatoria, y formato `^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$` tras quitar espacios y guiones y pasar a mayúsculas (regla del backend, no sale en el JSON); `marca` obligatoria, máx. 50; `modelo` obligatorio, máx. 80; `version` máx. 80 (opcional); `anio` entero ≥ 1980 y ≤ año actual; `kilometros` entero ≥ 0 |
| Solicitud | `vehiculoId`, `tipoServicio`, `conduccionSegura`, `urgencia`, `fechaPreferida`, `franjaPreferida`, `contactoPreferido` obligatorios; `sintoma` entre 20 y 2000 caracteres; `fechaPreferida` hoy o posterior; `aceptaPrivacidad` marcada |
| Asignación | `mecanicoId` obligatorio; `elevador` máx. 20; `fechaEstimada` como `date-time` (un `datetime-local` + `":00"`) |
| Cambio de estado | `estado` obligatorio; `descripcion` máx. 200 |
| Línea (pieza) | `tipo` = `pieza`, `piezaId` obligatorio; `cantidad` entero > 0 |
| Línea (mano de obra) | `tipo` = `mano_obra`; `concepto` obligatorio (máx. 150); `cantidad` (horas) > 0; `precioUnitario` (tarifa por hora) ≥ 0 |
| Presupuesto | `tiempoEstimadoHoras` > 0 (máx. 99,9); `garantiaMeses` entre 0 y 120 |
| Rechazo | `motivo` máx. 255 (opcional) |
| Pieza | `referencia` obligatoria, máx. 30; `nombre` obligatorio, máx. 120; `precio` ≥ 0; `stock` ≥ 0 |
| Ajuste de stock | `delta` entero distinto de 0; `motivo` máx. 200 |
| Usuario (admin) | mismas reglas que el registro (sin `aceptaPrivacidad`), más `rol` obligatorio |
| Filtros de listado | `limite` entre 1 y 100; `pagina` ≥ 1; `q` máx. 120 |

---

## 6. Credenciales de desarrollo

Con el backend arrancado con el perfil `local`, los usuarios de ejemplo son:

| Rol | Email |
|---|---|
| Administrador | `admin@taller.example` |
| Mecánico | `javi@taller.example` |
| Cliente | `laura@cliente.example` |

La contraseña de los tres es la de la propiedad `app.dev.password-semilla` de `application-local.properties`. Hay una orden de ejemplo (la **2481**, un Seat León, en estado `arreglando`) con presupuesto autorizado de 256,52 €.
