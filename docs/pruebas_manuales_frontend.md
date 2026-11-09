# Pruebas manuales del frontend de MotorLab

Casos de prueba de la demostración completa con los tres roles. Se ejecutan en el navegador, con el backend (perfil `local`) y el frontend arrancados.

## Cómo usar este documento

- Ejecuta los casos **en orden**: cada bloque usa los datos creados en los anteriores.
- Anota lo ocurrido en «Resultado obtenido» y marca el estado: `[x]` si coincide con lo esperado, `[F]` si falla.
- Cada caso indica con qué rol se ejecuta. Para cambiar de rol sin cerrar sesión, usa una ventana de incógnito o un perfil de navegador por rol, ya que la sesión se guarda por navegador.

## Preparación

**Usuarios.** La contraseña de los usuarios de ejemplo es la de la propiedad `app.dev.password-semilla` de `application-local.properties`.

| Rol | Correo |
|---|---|
| Administrador | `admin@taller.example` |
| Mecánico (Javi) | `javi@taller.example` |
| Cliente nuevo (se crea en el caso 1.1) | `marta.prueba@cliente.example`, contraseña `Prueba1234` |

**Datos que se crean durante las pruebas.**

| Dato | Valor |
|---|---|
| Vehículo A (se conserva) | Matrícula `1234 BCD`, Seat Ibiza, 2019, 60000 km |
| Vehículo B (se da de baja) | Matrícula `5678 FGH`, Renault Clio, 2017, 90000 km |
| Orden C | Solicitud de frenos que se cancela |
| Orden R | Solicitud cuyo presupuesto se rechaza |
| Orden D | Orden de la demostración: se autoriza y se repara hasta la entrega |

**Comprobación previa de la semilla.** Como administrador, abre `/taller/piezas` y comprueba estos valores, de los que dependen los importes y el error de stock:

| Referencia | Pieza | Precio | Stock |
|---|---|---|---|
| BR-2231 | Pastillas de freno delanteras | 86,00 € | 2 o más |
| DS-118 | Discos de freno delanteros | 36,00 € | 1 |
| LF-040 | Líquido de frenos DOT 4 | 12,00 € | 1 o más |

Si el stock de DS-118 no es 1, ajústalo con «Registrar entrada» y una cantidad positiva o negativa antes de empezar.

**Numeración.** El primer número del caso indica el bloque: 1 cuenta, 2 vehículos, 3 solicitudes, 4 administrador y presupuesto, 5 respuesta del cliente, 6 reparación, 7 seguimiento, 8 permisos, 9 sesión y 10 interfaz.

## Casos de prueba

| Nº | Rol | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| 1.1 | Invitado | En `/registro`, rellena nombre «Marta Prueba», `marta.prueba@cliente.example`, teléfono `612345678`, contraseña `Prueba1234`, acepta la privacidad y pulsa «Crear cuenta». | Aviso «Cuenta creada. Ya puedes iniciar sesión» y se abre `/login`. | | [ ] |
| 1.2 | Invitado | Repite el registro con el mismo correo. | Error junto al campo «Correo electrónico». No se crea la cuenta y se sigue en `/registro`. | | [ ] |
| 1.3 | Invitado | En `/registro`, escribe la contraseña `abc`, rellena el resto con un correo nuevo y pulsa «Crear cuenta». | Error «Debe tener al menos 8 caracteres» junto a la contraseña. No se envía el formulario. | | [ ] |
| 1.4 | Invitado | En `/login`, entra con `marta.prueba@cliente.example` y la contraseña `Incorrecta99`. | Aviso rojo «Credenciales incorrectas». Se sigue en `/login`. | | [ ] |
| 1.5 | Cliente | En `/login`, entra con el correo y la contraseña correctos. | Se abre `/cliente/ordenes`, sin órdenes todavía. | | [ ] |
| 2.1 | Cliente | En «Vehículos», pulsa «+ Añadir vehículo» y guarda el vehículo A. | Aviso «Vehículo añadido». El vehículo aparece en la lista con la matrícula `1234 BCD`. | | [ ] |
| 2.2 | Cliente | Intenta añadir otro vehículo con la matrícula `1234-bcd`. | Error de matrícula repetida junto al campo «Matrícula». No se crea el vehículo. | | [ ] |
| 2.3 | Cliente | Edita el vehículo A, cambia los kilómetros a `61000` y guarda. | Aviso «Vehículo actualizado». La lista muestra el nuevo dato. | | [ ] |
| 2.4 | Cliente | Añade el vehículo B. Pulsa «Dar de baja» en ese vehículo y confirma. | Se pide confirmación. Aviso «Vehículo dado de baja» y el vehículo desaparece de la lista. | | [ ] |
| 3.1 | Cliente | Inicia una solicitud con el vehículo A. En el paso del problema, escribe un síntoma de 10 caracteres y pulsa «Siguiente». | Error de longitud mínima en el síntoma. No se avanza de paso. | | [ ] |
| 3.2 | Cliente | Completa el síntoma con 20 caracteres o más y avanza. En el paso de la cita, elige una fecha de ayer y pulsa «Siguiente». | Error «La fecha debe ser hoy o posterior». No se avanza de paso. | | [ ] |
| 3.3 | Cliente | Crea la orden C: servicio Frenos, urgencia **Baja**, síntoma «Chirrían los frenos al llegar a un semáforo», fecha de mañana. Revisa el resumen y pulsa «Enviar solicitud». | Pantalla «Solicitud enviada» con urgencia **Alta**, porque el servidor la aplica en los frenos. | | [ ] |
| 3.4 | Cliente | Abre la orden C, pulsa «Cancelar orden» y confirma. | Se pide confirmación. Aviso «Orden cancelada», estado «Cancelada» y desaparece el botón. La orden pasa a «Historial». | | [ ] |
| 3.5 | Cliente | Crea dos solicitudes de frenos con el vehículo A: la orden R y la orden D. Anota sus números. | Ambas se crean con urgencia Alta y aparecen en «Activas». | | [ ] |
| 3.6 | Cliente | En «Vehículos», intenta dar de baja el vehículo A y confirma. | Mensaje de error del servidor porque tiene órdenes abiertas. El vehículo sigue en la lista. | | [ ] |
| 4.1 | Administrador | En `/taller/solicitudes`, filtra por urgencia «Alta» y después por estado «Solicitud recibida». | La tabla solo muestra órdenes que cumplen el filtro, incluidas R y D. | | [ ] |
| 4.2 | Administrador | Quita los filtros, busca `1234` y recarga la página. | Solo aparecen las órdenes del vehículo A. Tras recargar, la búsqueda se mantiene. | | [ ] |
| 4.3 | Administrador | Abre la orden D. En «Asignación», elige a Javi, elevador `2` y una fecha estimada. Pulsa «Guardar asignación». | Aviso «Asignación guardada». Los datos se mantienen al recargar. | | [ ] |
| 4.4 | Administrador | Pulsa «Crear presupuesto». | Se abre el editor de la orden D con un presupuesto vacío en borrador. | | [ ] |
| 4.5 | Administrador | Añade 3 líneas del catálogo: BR-2231 × 1, DS-118 × 2 y LF-040 × 1. Añade 1 línea de mano de obra: «Mano de obra», 1,5 h a 28 €/h. | Subtotal **212,00 €**, IVA 21 % **44,52 €** y total **256,52 €**. | | [ ] |
| 4.6 | Administrador | Observa la línea de DS-118. | Aparece el aviso de stock «Stock 1 de 2». El presupuesto se puede enviar igualmente. | | [ ] |
| 4.7 | Administrador | Pulsa «Enviar presupuesto al cliente» y confirma. | Aviso «Presupuesto enviado al cliente». La orden D pasa a «Presupuesto enviado» y el presupuesto ya no se puede editar. | | [ ] |
| 4.8 | Administrador | En la orden R, crea un presupuesto con 1 línea de mano de obra de 1 h a 28 €/h y envíalo. | Subtotal 28,00 €, IVA 5,88 € y total 33,88 €. La orden R pasa a «Presupuesto enviado». | | [ ] |
| 5.1 | Cliente | Entra en «Avisos» y luego en «Órdenes». | Hay un aviso por cada presupuesto recibido. Las órdenes R y D muestran «Presupuesto listo» y su total. | | [ ] |
| 5.2 | Cliente | En la orden D, pulsa «Ver presupuesto». | Se ven las 4 líneas, los importes 212,00 / 44,52 / 256,52 € y los botones «Rechazar» y «Autorizar». | | [ ] |
| 5.3 | Cliente | En el presupuesto de la orden R, pulsa «Rechazar», escribe el motivo «Prefiero pensarlo» y confirma. | El presupuesto aparece como «Rechazado» con ese motivo. La orden R pasa a «Presupuesto rechazado» y a «Historial». | | [ ] |
| 5.4 | Cliente | En el presupuesto de la orden D, pulsa «Autorizar» y confirma. | El presupuesto aparece como «Autorizado». La orden D pasa a «Presupuesto autorizado». | | [ ] |
| 6.1 | Administrador | En la orden D, pulsa «Marcar como recibido». | Aviso «Estado actualizado». Estado «Recibido». | | [ ] |
| 6.2 | Mecánico | En `/taller/mis-ordenes`, localiza la orden D y ábrela. | La tarjeta muestra el vehículo, la matrícula, el servicio, el elevador, la urgencia, el estado y un progreso de 20 %. Al pulsarla se abre su detalle. | | [ ] |
| 6.3 | Mecánico | Elige «Preparación» y pulsa «Guardar cambio». | Aviso «Estado actualizado». Estado «En preparación». | | [ ] |
| 6.4 | Mecánico | Elige «Esperando pieza», escribe la nota «Pastillas pedidas» y pulsa «Guardar cambio». | Estado «Esperando pieza» y la nota se vacía. «Piezas del presupuesto» muestra DS-118 con la pill roja «Stock 1 · faltan 1» y aparece el aviso ámbar para pasar a Arreglando. | | [ ] |
| 6.5 | Mecánico | Elige «Arreglando» y pulsa «Guardar cambio». | Aviso rojo de stock insuficiente con el detalle «DS-118: Stock 1, necesarias 2». El estado sigue siendo «Esperando pieza». | | [ ] |
| 6.6 | Administrador | En `/taller/piezas`, en DS-118, pulsa «Registrar entrada», escribe la cantidad `4` y el motivo «Reposición» y guarda. | Aviso «Stock actualizado». DS-118 pasa a stock 5. | | [ ] |
| 6.7 | Mecánico | Recarga la orden D, elige «Arreglando» y pulsa «Guardar cambio». | Antes de guardar, DS-118 está en verde y no hay aviso ámbar. Tras guardar, el estado es «Arreglando». El stock de DS-118 baja a 3 (compruébalo como administrador). | | [ ] |
| 6.8 | Mecánico | Elige «Listo» y pulsa «Guardar cambio». | Estado «Listo para recoger». Desaparecen la nota y «Guardar cambio». | | [ ] |
| 6.9 | Administrador | En la orden D, pulsa «Marcar como entregado». | Aviso «Estado actualizado». Estado «Entregado». | | [ ] |
| 7.1 | Cliente | Abre la orden D en «Historial» y revisa el seguimiento. | Los 5 pasos (Recibido, En preparación, Esperando pieza, Arreglando y Listo) aparecen completados, cada uno con su hora. El progreso es 100 %. La nota «Pastillas pedidas» aparece en su paso. | | [ ] |
| 8.1 | Cliente | Con la sesión de Marta, abre `/cliente/ordenes/2481`, que es de otro cliente. | Se muestra «Orden no encontrada» (el servidor responde 404). No aparece ningún dato de la orden. | | [ ] |
| 8.2 | Cliente | Escribe la dirección `/taller`. Después pulsa «Ir al inicio». | Se abre la página 403. El botón lleva a `/cliente/ordenes`. | | [ ] |
| 8.3 | Mecánico | Escribe la dirección `/taller/usuarios`. | Se abre la página 403. | | [ ] |
| 8.4 | Mecánico | Abre `/taller/piezas`. | Se ve la tabla, sin «+ Nueva pieza» y sin columna de acciones. | | [ ] |
| 9.1 | Cliente | En `/cliente/ordenes`, recarga la página. | Se sigue en la misma pantalla con la sesión iniciada. | | [ ] |
| 9.2 | Cliente | Pulsa «Cerrar sesión» y después el botón Atrás del navegador. | Se abre `/login`. No se ve ninguna pantalla privada. | | [ ] |
| 9.3 | Cliente | Inicia sesión. En las herramientas del navegador, cambia el valor de `motorlab.token` en `localStorage` por `caducado`, para simularlo. Sin recargar, ve a otra sección con datos, como «Vehículos». | Se abre `/login` con la ruta anterior en `returnUrl`. Al volver a entrar, se regresa a esa ruta. | | [ ] |
| 10.1 | Cliente | Con el modo responsive del navegador a **360 px** de ancho, recorre Órdenes, detalle de orden, presupuesto, Vehículos, nueva solicitud y Avisos. | No hay desplazamiento horizontal de la página ni textos cortados. Los botones se pueden pulsar y la navegación está siempre accesible. | | [ ] |
| 10.2 | Administrador y mecánico | A **1280 px** de ancho, recorre Solicitudes, detalle de orden, editor de presupuesto, Piezas, Usuarios y Panel como administrador, y Mis órdenes y su detalle como mecánico. | La barra lateral y el contenido caben sin desplazamiento horizontal. Las tablas y las tarjetas se ven completas, sin solaparse. | | [ ] |
