#!/usr/bin/env bash
# MotorLab · Crea les 30 issues del frontend en ordre i guarda els números reals a issues_frontend.txt
# Requisits: GitHub CLI (gh) instal·lat i `gh auth login` fet. Executa'l des de l'arrel del repositori.
set -e

prev="cap"
: > issues_frontend.txt

crear() {
  local pas="$1" titulo="$2" body url num
  body="$(cat)"
  body="${body//__PREV__/$prev}"
  url="$(gh issue create --title "$titulo" --body "$body")"
  num="${url##*/}"
  echo "Pas F$pas -> #$num"
  echo "F$pas #$num $titulo" >> issues_frontend.txt
  prev="#$num"
}

crear 01 "[Frontend] Crear el projecte Angular a l'arrel del repositori" <<'EOF_ISSUE'
## Objectiu
Tindre el projecte Angular creat a l'arrel del repositori del frontend (separat del del backend), amb les instruccions per a l'assistent d'IA, l'API de referència (`Motorlab_Api.md` i `MotorLab-API.json`) i les maquetes dins de `docs/`.

## Tasques
- [ ] Crear el repositori del frontend a GitHub i clonar-lo en local
- [ ] Instal·lar Angular CLI i generar el projecte a l'arrel del repositori (routing, SCSS)
- [ ] Crear `.github/instructions/frontend.instructions.md` amb el Prompt 0 del frontend
- [ ] Copiar `Motorlab_Api.md` i `MotorLab-API.json` a `docs/` i les maquetes a `docs/maquetas/`
- [ ] Comprovar que l'aplicació arranca i compila

## Criteris d'acceptació
- [ ] `npm start` mostra l'aplicació a `http://localhost:4200`
- [ ] `npm run build` acaba sense errors
- [ ] El repositori té un únic `.git` (a l'arrel) i `node_modules/` i `.angular/` no apareixen a `git status`
- [ ] Existeixen `docs/Motorlab_Api.md`, `docs/MotorLab-API.json` i `docs/maquetas/`

## Fitxers i components
- `arrel`: `package.json`, `angular.json`, `tsconfig.json`, `src/`

## Requereix del backend
Cap (encara no fa peticions).

## Depèn de
Cap (és la primera issue del frontend).

## Guia
Pas F01 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 02 "[Frontend] Configuració base: proxy, entorns i estructura de carpetes" <<'EOF_ISSUE'
## Objectiu
Preparar el proxy cap al backend, els entorns, l'estructura de carpetes i els àlies d'importació.

## Tasques
- [ ] Crear `proxy.conf.json` i configurar `npm start` perquè l'use
- [ ] Crear els entorns amb `apiUrl: '/api/v1'`
- [ ] Registrar `provideHttpClient` a `app.config.ts`
- [ ] Crear l'estructura de carpetes (`core`, `shared`, `layouts`, `features`) i els àlies de TypeScript

## Criteris d'acceptació
- [ ] Amb el backend arrancat, `curl -i http://localhost:4200/api/v1/auth/yo` torna **401** amb JSON de Spring (el proxy funciona)
- [ ] `npm run build` sense errors
- [ ] Existeixen les carpetes de `src/app` amb el seu `.gitkeep`

## Fitxers i components
- `arrel`: `proxy.conf.json`, `environment.ts`, `environment.development.ts`

## Requereix del backend
Cap per a configurar-ho; per a comprovar el proxy, el backend arrancat (pas 9 del backend).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F02 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 03 "[Frontend] Estils globals i tokens de disseny (SCSS)" <<'EOF_ISSUE'
## Objectiu
Definir l'aspecte visual de l'aplicació a partir de les maquetes: colors, tipografia, botons, etiquetes, targetes i formularis.

## Tasques
- [ ] Crear els tokens (`_tokens.scss`), la base (`_base.scss`) i els components d'estil (`_components.scss`)
- [ ] Instal·lar la tipografia Inter amb `@fontsource/inter`
- [ ] Crear una pàgina de mostra `/estilos` (només per a desenvolupament)

## Criteris d'acceptació
- [ ] La pàgina `/estilos` mostra colors, botons, etiquetes, targetes i camps amb l'aspecte de les maquetes
- [ ] El focus de teclat es veu en tots els elements interactius
- [ ] `npm run build` sense errors

## Fitxers i components
- `styles`: `_tokens.scss`, `_base.scss`, `_componentes.scss`, `styles.scss`
- `features/estilos`: `EstilosComponent`

## Requereix del backend
Cap.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F03 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 04 "[Frontend] Models TypeScript de l'API i lògica d'estats" <<'EOF_ISSUE'
## Objectiu
Tindre els tipus TypeScript que reflecteixen el JSON de l'API i la lògica de transicions d'estat que usaran les pantalles.

## Tasques
- [ ] Crear els models a `core/models` (copiant `docs/Motorlab_Api.md` i contrastant amb `docs/MotorLab-API.json`)
- [ ] Crear les etiquetes en castellà de estats, urgències i serveis
- [ ] Crear `core/util/estados.ts` (estats actius, finals, transicions) i la seua prova

## Criteris d'acceptació
- [ ] `npm run build` sense errors
- [ ] Les proves passen: `siguientesEstados` respecta les transicions i els permisos per rol
- [ ] Les propietats dels models estan en camelCase, com el JSON

## Fitxers i components
- `core/models`: `tipos.model.ts`, `usuario.model.ts`, `vehiculo.model.ts`, `orden.model.ts`, `presupuesto.model.ts`, `pieza.model.ts`, `notificacion.model.ts`, `panel.model.ts`, `pagina.model.ts`, `api-error.model.ts`, `etiquetas.ts`, `index.ts`
- `core/util`: `estados.ts`, `estados.spec.ts`

## Requereix del backend
Cap (només tipus i lògica).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F04 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 05 "[Frontend] Servei d'autenticació amb signals i emmagatzematge del token" <<'EOF_ISSUE'
## Objectiu
Gestionar la sessió: login, registre, tancament de sessió i recuperació de l'usuari en recarregar la pàgina.

## Tasques
- [ ] Crear `AuthService` amb signals (`usuario`, `token`, `estaAutenticado`, `rol`)
- [ ] Implementar `login`, `registro`, `cargarUsuario` i `cerrarSesion`
- [ ] Restaurar la sessió en arrancar l'aplicació
- [ ] Crear la prova `auth.service.spec.ts`

## Criteris d'acceptació
- [ ] Les proves passen
- [ ] Després d'un login, el token queda guardat i es recupera en recarregar la pàgina
- [ ] `cerrarSesion` esborra el token i l'usuari i porta a `/login`

## Fitxers i components
- `core/services`: `AuthService`, `auth.service.spec.ts`

## Requereix del backend
Pas 9 (configuració de Spring Security), pas 10 (registre i login) i pas 11 (usuaris d'exemple).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F05 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 06 "[Frontend] Interceptors d'autenticació i d'errors" <<'EOF_ISSUE'
## Objectiu
Afegir el token a cada petició i convertir els errors de l'API en un tipus propi, tancant la sessió davant un 401.

## Tasques
- [ ] Crear la classe `ApiError` i les utilitats de `core/util/api-error.ts`
- [ ] Crear `authInterceptor` (afig `Authorization: Bearer`) i `errorInterceptor`
- [ ] Registrar-los a `app.config.ts`
- [ ] Crear les proves dels interceptors

## Criteris d'acceptació
- [ ] Les proves passen
- [ ] Una petició a l'API porta la capçalera `Authorization` quan hi ha token
- [ ] Un 401 en una petició protegida tanca la sessió i porta a `/login`; un 401 del propi login NO tanca la sessió

## Fitxers i components
- `core/util`: `api-error.ts`
- `core/interceptors`: `auth.interceptor.ts`, `error.interceptor.ts`, `auth.interceptor.spec.ts`, `error.interceptor.spec.ts`

## Requereix del backend
Pas 9 (configuració de Spring Security) i pas 10 (registre i login).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F06 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 07 "[Frontend] Toasts, idioma (es-ES) i pipes d'imports i dates" <<'EOF_ISSUE'
## Objectiu
Mostrar missatges a l'usuari, formatar imports i dates en castellà i avisar dels errors de xarxa i del servidor.

## Tasques
- [ ] Crear `ToastService` i `ToastContenedorComponent`
- [ ] Configurar el locale `es-ES`
- [ ] Crear `EurosPipe` i `FechaHoraPipe`
- [ ] Fer que l'interceptor d'errors mostre un toast en errors de xarxa i 5xx

## Criteris d'acceptació
- [ ] Un toast d'èxit i un d'error apareixen i desapareixen soles als 5 segons
- [ ] `256.52` es mostra com `256,52 €` amb `EurosPipe`
- [ ] Parar el backend i fer una petició mostra el toast «No se puede conectar con el servidor»

## Fitxers i components
- `core/services`: `ToastService`
- `shared/components`: `ToastContenedorComponent`
- `shared/pipes`: `EurosPipe`, `FechaHoraPipe`

## Requereix del backend
Cap (components de presentació).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F07 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 08 "[Frontend] Components d'UI reutilitzables (pills, progrés, paginador, modal i errors de camp)" <<'EOF_ISSUE'
## Objectiu
Crear els components compartits que usaran totes les pantalles.

## Tasques
- [ ] Crear `PillEstadoComponent`, `PillUrgenciaComponent` i `BarraProgresoComponent`
- [ ] Crear `CargandoComponent`, `VacioComponent` i `PaginadorComponent`
- [ ] Crear `ModalConfirmacionComponent` i `ErroresCampoComponent`

## Criteris d'acceptació
- [ ] Tots els components apareixen a `/estilos` amb exemples
- [ ] El modal es tanca amb `Escape` i retorna el focus al botó que l'ha obert
- [ ] `npm run build` sense errors

## Fitxers i components
- `shared/components`: `PillEstadoComponent`, `PillUrgenciaComponent`, `BarraProgresoComponent`, `CargandoComponent`, `VacioComponent`, `PaginadorComponent`, `ModalConfirmacionComponent`, `ErroresCampoComponent`

## Requereix del backend
Cap (components de presentació).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F08 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 09 "[Frontend] Guards d'autenticació i de rol, i esquelet de rutes" <<'EOF_ISSUE'
## Objectiu
Protegir les rutes segons la sessió i el rol i deixar preparades totes les rutes de l'aplicació.

## Tasques
- [ ] Crear `authGuard`, `rolGuard` i `invitadoGuard`
- [ ] Crear `redirigirSegunRol` (pantalla d'inici per rol)
- [ ] Definir `app.routes.ts` amb totes les rutes (càrrega mandrosa) i un `PendienteComponent` provisional
- [ ] Crear la prova dels guards

## Criteris d'acceptació
- [ ] Sense sessió, qualsevol ruta protegida porta a `/login`
- [ ] Un client que entra a `/taller/...` va a `/403`
- [ ] Les proves dels guards passen

## Fitxers i components
- `core/guards`: `authGuard`, `rolGuard`, `invitadoGuard`, `guards.spec.ts`
- `core/util`: `rutas.ts`
- `shared/components`: `PendienteComponent`
- `app`: `app.routes.ts`

## Requereix del backend
Pas 9 i 10 (autenticació) per a provar-ho.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F09 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 10 "[Frontend] Pàgines de login i de registre amb formularis reactius" <<'EOF_ISSUE'
## Objectiu
Que un usuari puga registrar-se i iniciar sessió, amb validació i errors del servidor mostrats als camps.

## Tasques
- [ ] Crear `aplicarErroresServidor` i `validadores.ts` a `core/util`
- [ ] Crear `LoginComponent` i `RegistroComponent` (Figura 3)
- [ ] Redirigir segons el rol (o `returnUrl`) després d'iniciar sessió
- [ ] Crear les proves dels formularis

## Criteris d'acceptació
- [ ] Un login correcte porta a la pantalla d'inici del rol (o a `returnUrl`)
- [ ] Unes credencials errònies mostren «Credenciales incorrectas» sense tancar res
- [ ] Registrar-se amb un email repetit mostra l'error al camp `email`
- [ ] Les proves passen

## Fitxers i components
- `core/util`: `formularios.ts`, `validadores.ts`, `formularios.spec.ts`, `validadores.spec.ts`
- `features/auth`: `LoginComponent`, `RegistroComponent`, `login.component.spec.ts`, `registro.component.spec.ts`

## Requereix del backend
Pas 10 (registre i login) i pas 11 (usuaris d'exemple).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F10 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 11 "[Frontend] Layouts de la zona del client (mòbil) i del taller (escriptori)" <<'EOF_ISSUE'
## Objectiu
Crear l'estructura visual de les dues zones: capçalera i barra inferior per al client, barra lateral per al taller.

## Tasques
- [ ] Crear `ClienteLayoutComponent` (capçalera naranja, pestanyes inferiors, campaneta d'avisos)
- [ ] Crear `TallerLayoutComponent` (barra lateral per rol, usuari i tancament de sessió)
- [ ] Connectar els layouts a les rutes `/cliente` i `/taller`

## Criteris d'acceptació
- [ ] La zona del client mostra la barra inferior (Vehículos, Órdenes, Avisos, Perfil) i es veu bé en mòbil
- [ ] La zona del taller mostra la barra lateral amb les opcions del rol (admin: 6; mecànic: 2)
- [ ] El botó de tancar sessió porta a `/login`

## Fitxers i components
- `layouts`: `ClienteLayoutComponent`, `TallerLayoutComponent`

## Requereix del backend
Pas 10 (registre i login) per a veure l'usuari de la sessió.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F11 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 12 "[Frontend] Vehicles del client: llistat, alta, edició i baixa" <<'EOF_ISSUE'
## Objectiu
Que un client done d'alta, consulte, modifique i done de baixa els seus vehicles (Figura 4).

## Tasques
- [ ] Crear `matricula.ts` (normalització i validador) i `VehiculosService`
- [ ] Crear `VehiculosListaComponent` i `VehiculoFormComponent`
- [ ] Gestionar els errors 409 (`MATRICULA_DUPLICADA`, `CONFLICTO`)

## Criteris d'acceptació
- [ ] Un client veu els seus vehicles, en crea un i el modifica (la matrícula no es pot canviar)
- [ ] Una matrícula repetida mostra l'error al camp `matricula`
- [ ] Donar de baixa un vehicle amb ordres obertes mostra el missatge del servidor
- [ ] Les proves passen

## Fitxers i components
- `core/util`: `matricula.ts`, `matricula.spec.ts`
- `core/services`: `VehiculosService`, `vehiculos.service.spec.ts`
- `features/vehiculos`: `VehiculosListaComponent`, `VehiculoFormComponent`

## Requereix del backend
Pas 12 (validació de matrícula) i pas 13 (vehicles).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F12 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 13 "[Frontend] Servei d'ordres i formulari de nova sol·licitud de reparació" <<'EOF_ISSUE'
## Objectiu
Que un client envie una sol·licitud de reparació amb un formulari per passos (Figura 5).

## Tasques
- [ ] Crear `OrdenesService` (crear, llistar, obtenir, seguiment, cancel·lar)
- [ ] Crear `SolicitudNuevaComponent` amb 3 passos i resum
- [ ] Mostrar la urgència resultant i l'avís informatiu de la regla de frenos

## Criteris d'acceptació
- [ ] Una sol·licitud de **frenos** es crea i es mostra `urgencia: alta`
- [ ] Un síntoma de menys de 20 caràcters no deixa avançar
- [ ] Una data passada no és vàlida
- [ ] Les proves passen

## Fitxers i components
- `core/services`: `OrdenesService`, `ordenes.service.spec.ts`
- `features/ordenes`: `SolicitudNuevaComponent`, `solicitud-nueva.component.spec.ts`

## Requereix del backend
Pas 13 (vehicles) i pas 15 (sol·licituds).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F13 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 14 "[Frontend] Llistat d'ordres del client i historial del vehicle" <<'EOF_ISSUE'
## Objectiu
Que el client veja les seues ordres actives i l'historial, amb estat, progrés i pressupost pendent (Figura 6).

## Tasques
- [ ] Crear `OrdenesListaClienteComponent` amb pestanyes Activas / Historial
- [ ] Crear `VehiculoHistorialComponent`
- [ ] Mostrar el pressupost pendent amb un botó «Ver presupuesto»

## Criteris d'acceptació
- [ ] Les ordres s'agrupen en Activas i Historial segons el seu estat
- [ ] Una ordre amb pressupost enviat mostra «Presupuesto listo» i el seu total
- [ ] L'historial d'un vehicle mostra només les ordres d'eixe vehicle

## Fitxers i components
- `features/ordenes`: `OrdenesListaClienteComponent`
- `features/vehiculos`: `VehiculoHistorialComponent`

## Requereix del backend
Pas 15 (sol·licituds) i pas 16 (historial del vehicle).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F14 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 15 "[Frontend] Detall i seguiment de l'ordre per al client (línia de temps)" <<'EOF_ISSUE'
## Objectiu
Mostrar al client el seguiment de la seua reparació en una línia de temps amb progrés i hora estimada (Figura 8), i permetre cancel·lar.

## Tasques
- [ ] Crear `LineaTiempoComponent` compartit
- [ ] Crear `OrdenDetalleClienteComponent` amb dades, seguiment i cancel·lació
- [ ] Actualitzar el seguiment automàticament cada 30 segons mentre l'ordre no estiga en un estat final

## Criteris d'acceptació
- [ ] L'ordre d'exemple (2481) mostra la línia de temps amb 4 esdeveniments i un 80 %
- [ ] Els estats pendents apareixen en gris
- [ ] El client pot cancelar fins a `presupuesto_enviado`, amb confirmació
- [ ] L'actualització automàtica s'atura en eixir de la pantalla

## Fitxers i components
- `shared/components`: `LineaTiempoComponent`
- `features/ordenes`: `OrdenDetalleClienteComponent`

## Requereix del backend
Pas 15 (sol·licituds), pas 21 (cancel·lar) i pas 22 (seguiment).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F15 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 16 "[Frontend] Pressupost del client: consultar, autoritzar i rebutjar" <<'EOF_ISSUE'
## Objectiu
Que el client vega el pressupost amb el desglossament i el puga autoritzar o rebutjar (Figura 7).

## Tasques
- [ ] Crear `PresupuestosService` amb tots els mètodes de l'API
- [ ] Crear `PresupuestoClienteComponent` amb Autorizar i Rechazar (amb motiu)
- [ ] Gestionar l'estat «encara no hi ha pressupost» (404)

## Criteris d'acceptació
- [ ] El client veu el desglossament, el subtotal, l'IVA, el total, el termini i la garantia
- [ ] Autoritzar canvia l'estat a «autorizado»; rebutjar demana un motiu opcional
- [ ] Un segon intent d'autoritzar mostra l'error 409 del servidor

## Fitxers i components
- `core/services`: `PresupuestosService`, `presupuestos.service.spec.ts`
- `features/presupuestos`: `PresupuestoClienteComponent`

## Requereix del backend
Pas 19 (línies de pressupost) i pas 20 (enviar, autoritzar i rebutjar).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F16 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 17 "[Frontend] Notificacions: contador, llistat i marcar com a llegides" <<'EOF_ISSUE'
## Objectiu
Mostrar els avisos de l'usuari, amb un comptador a la campaneta que s'actualitza cada 30 segons.

## Tasques
- [ ] Crear `NotificacionesService`
- [ ] Crear un comptador amb consulta periòdica i connectar-lo a la campaneta del layout
- [ ] Crear `AvisosComponent` amb marcar com a llegida i marcar-les totes

## Criteris d'acceptació
- [ ] El comptador de la campaneta coincideix amb `GET /notificaciones/contador`
- [ ] En marcar una notificació com a llegida, el comptador baixa
- [ ] En tancar la sessió, la consulta periòdica s'atura
- [ ] Una notificació amb `ordenId` porta a la seua ordre segons el rol

## Fitxers i components
- `core/services`: `NotificacionesService`, `NotificacionesContadorService`
- `features/notificaciones`: `AvisosComponent`

## Requereix del backend
Pas 23 (notificacions).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F17 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 18 "[Frontend] Perfil de l'usuari i tancament de sessió" <<'EOF_ISSUE'
## Objectiu
Mostrar les dades de l'usuari i permetre tancar la sessió.

## Tasques
- [ ] Crear `PerfilComponent` amb les dades de l'usuari i el botó de tancar sessió amb confirmació

## Criteris d'acceptació
- [ ] `/cliente/perfil` mostra nom, correu, telèfon i rol
- [ ] Tancar la sessió esborra el token i porta a `/login`

## Fitxers i components
- `features/perfil`: `PerfilComponent`

## Requereix del backend
Pas 10 (`/auth/yo`).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F18 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 19 "[Frontend] Taller: serveis d'usuaris i llistat de sol·licituds amb filtres" <<'EOF_ISSUE'
## Objectiu
Que l'administrador veja totes les ordres amb filtres per estat, urgència, mecànic i cerca (Figura 9).

## Tasques
- [ ] Crear `UsuariosService`
- [ ] Crear `SolicitudesListaComponent` amb taula, filtres, cerca amb debounce i paginació
- [ ] Guardar els filtres a la URL (query params)

## Criteris d'acceptació
- [ ] La taula mostra les ordres amb urgència i estat en pills
- [ ] Els filtres i la cerca per matrícula o nom funcionen i es mantenen en recarregar
- [ ] Fer clic en una fila porta a `/taller/ordenes/ID`
- [ ] Un mecànic no pot entrar en esta pantalla

## Fitxers i components
- `core/services`: `UsuariosService`, `usuarios.service.spec.ts`
- `features/taller/solicitudes`: `SolicitudesListaComponent`

## Requereix del backend
Pas 11 (usuaris) i pas 15 (llistat d'ordres).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F19 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 20 "[Frontend] Taller: detall de l'ordre, assignació, canvi d'estat i cancel·lació" <<'EOF_ISSUE'
## Objectiu
Que l'administrador revise una sol·licitud, assigne mecànic i elevador, faça avançar l'ordre i cree el pressupost (Figura 10).

## Tasques
- [ ] Afegir `asignar` i `cambiarEstado` a `OrdenesService`
- [ ] Crear `MatriculaComponent` (placa) compartit
- [ ] Crear `OrdenDetalleTallerComponent` amb targetes, assignació, accions d'estat i creació del pressupost

## Criteris d'acceptació
- [ ] L'administrador assigna mecànic, elevador i data estimada i es guarda
- [ ] Els botons d'estat només mostren les transicions permeses (`siguientesEstados`)
- [ ] «Crear presupuesto» crea el pressupost en esborrany i porta a l'editor
- [ ] Cancel·lar una ordre demana confirmació

## Fitxers i components
- `core/services`: `OrdenesService`, `(asignar,`, `cambiarEstado)`
- `shared/components`: `MatriculaComponent`
- `features/taller/orden-detalle`: `OrdenDetalleTallerComponent`

## Requereix del backend
Pas 17 (assignació), pas 19 (pressupostos), pas 21 (canvi d'estat i cancel·lació) i pas 22 (seguiment).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F20 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 21 "[Frontend] Taller: editor de pressupost amb línies, peces i totals" <<'EOF_ISSUE'
## Objectiu
Que l'administrador elabore el pressupost afegint peces del catàleg i mà d'obra, veja els totals i l'avís d'stock, i l'envie al client (Figura 11).

## Tasques
- [ ] Crear `PiezasService` (llistat per a la cerca)
- [ ] Crear `LineaDialogComponent` (pieza o mano de obra)
- [ ] Crear `PresupuestoEditorComponent` amb línies, totals, termini, garantia, avisos d'stock i enviament

## Criteris d'acceptació
- [ ] Afegir les 4 línies de la demostració dona **212,00 / 44,52 / 256,52** (valors del servidor)
- [ ] Una peça sense stock suficient mostra l'avís «Stock 1 de 2» sense impedir guardar
- [ ] Un pressupost ja enviat es mostra en només lectura
- [ ] «Enviar presupuesto» demana confirmació i canvia l'estat a «enviado»

## Fitxers i components
- `core/services`: `PiezasService`, `piezas.service.spec.ts`
- `features/taller/presupuesto-editor`: `LineaDialogComponent`, `PresupuestoEditorComponent`

## Requereix del backend
Pas 18 (peces), pas 19 (línies del pressupost) i pas 20 (enviar).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F21 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 22 "[Frontend] Taller: catàleg de peces i gestió d'stock" <<'EOF_ISSUE'
## Objectiu
Que l'administrador gestione les peces i el seu stock, i que el mecànic les puga consultar (Figura 13).

## Tasques
- [ ] Ampliar `PiezasService` (crear, actualitzar, baixa, ajust d'stock)
- [ ] Crear `PiezasListaComponent` amb cerca, filtres i paginació
- [ ] Crear els diàlegs de peça i d'ajust d'stock (només administrador)

## Criteris d'acceptació
- [ ] Es veuen les peces amb preu, stock i estat (stock baix en roig)
- [ ] L'administrador crea, edita i dona de baixa peces; el mecànic només les veu
- [ ] Registrar una entrada de stock +4 de DS-118 actualitza la fila
- [ ] Un ajust que deixaria l'stock negatiu mostra l'error 409

## Fitxers i components
- `core/services`: `PiezasService`, `(escritura)`
- `features/taller/piezas`: `PiezasListaComponent`, `PiezaDialogComponent`, `StockDialogComponent`

## Requereix del backend
Pas 18 (peces i stock).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F22 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 23 "[Frontend] Mecànic: les meues ordres i canvi d'estat de la reparació" <<'EOF_ISSUE'
## Objectiu
Que el mecànic veja les ordres que té assignades i faça avançar la reparació, amb avís de les peces sense stock (Figura 12).

## Tasques
- [ ] Crear `MisOrdenesMecanicoComponent` amb targetes i progrés
- [ ] Crear `OrdenMecanicoComponent` amb botons d'estat, nota per al client i peces del pressupost
- [ ] Gestionar els errors 409 `STOCK_INSUFICIENTE` i `TRANSICION_NO_PERMITIDA`

## Criteris d'acceptació
- [ ] El mecànic només veu les ordres assignades a ell
- [ ] Només pot triar els estats `en_preparacion`, `esperando_pieza`, `arreglando` i `listo`
- [ ] Passar a «arreglando» sense stock mostra «Stock 1, necesarias 2» i l'estat no canvia
- [ ] Un administrador no pot entrar a esta pantalla

## Fitxers i components
- `features/taller/mecanico`: `MisOrdenesMecanicoComponent`, `OrdenMecanicoComponent`

## Requereix del backend
Pas 21 (canvi d'estat) i pas 19–20 (pressupost, que el mecànic pot consultar).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F23 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 24 "[Frontend] Taller: gestió d'usuaris (administrador)" <<'EOF_ISSUE'
## Objectiu
Que l'administrador llistate, cree i active o desactive usuaris (mecànics, administradors i clients).

## Tasques
- [ ] Crear `UsuariosListaComponent` amb filtre per rol i paginació
- [ ] Crear `UsuarioDialogComponent` per a crear usuaris
- [ ] Activar i desactivar usuaris, bloquejant el propi

## Criteris d'acceptació
- [ ] L'administrador veu la llista i filtra per rol
- [ ] Pot crear un mecànic nou amb contrasenya
- [ ] Pot activar i desactivar usuaris, però no el seu propi
- [ ] Un mecànic no pot entrar a `/taller/usuarios`

## Fitxers i components
- `features/taller/usuarios`: `UsuariosListaComponent`, `UsuarioDialogComponent`

## Requereix del backend
Pas 11 (gestió d'usuaris).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F24 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 25 "[Frontend] Taller: panell de mètriques" <<'EOF_ISSUE'
## Objectiu
Mostrar a l'administrador els indicadors del mes i les ordres per estat (Figura 14).

## Tasques
- [ ] Crear `PanelService` i `PanelComponent`
- [ ] Mostrar 4 indicadors i un gràfic de barres per estat amb CSS (sense llibreries)

## Criteris d'acceptació
- [ ] Els 4 indicadors coincideixen amb la resposta de `GET /panel/metricas`
- [ ] Les barres per estat són proporcionals
- [ ] Els ingressos del mes es mostren en euros

## Fitxers i components
- `core/services`: `PanelService`, `panel.service.spec.ts`
- `features/taller/panel`: `PanelComponent`

## Requereix del backend
Pas 24 (panell de mètriques).

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F25 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 26 "[Frontend] Pàgines d'error (403, 404), gestor global d'errors i neteja de la pàgina de mostra" <<'EOF_ISSUE'
## Objectiu
Tancar els casos d'error de l'aplicació i llevar el que només servia per a desenvolupar.

## Tasques
- [ ] Crear les pàgines `/403` i `/404`
- [ ] Crear un `ErrorHandler` global que registre l'error i mostre un toast
- [ ] Eliminar la ruta i la pàgina `/estilos` (o limitar-la a desenvolupament)
- [ ] Revisar que cap component use `HttpClient` directament

## Criteris d'acceptació
- [ ] Una URL inexistent mostra la pàgina 404 amb un botó per a tornar a l'inici
- [ ] Un client que entra a `/taller/...` veu la pàgina 403
- [ ] Un error no controlat mostra un toast en lloc de deixar la pantalla en blanc
- [ ] `git grep HttpClient` només apareix als serveis i a la configuració

## Fitxers i components
- `shared/components`: `Error403Component`, `Error404Component`
- `core/services`: `GestorErrores`

## Requereix del backend
Cap.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F26 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 27 "[Frontend] Proves manuals de la demostració completa amb els tres rols" <<'EOF_ISSUE'
## Objectiu
Documentar i executar les proves manuals del cas del Seat León, de principi a fi, amb client, administrador i mecànic.

## Tasques
- [ ] Crear `docs/pruebas_manuales_frontend.md` amb els casos de prova
- [ ] Executar-los i anotar els resultats
- [ ] Corregir els errors que apareguen

## Criteris d'acceptació
- [ ] Tots els casos de `docs/pruebas_manuales_frontend.md` estan marcats com a correctes
- [ ] La demostració completa funciona des del navegador amb els tres rols

## Fitxers i components
- `docs`: `pruebas_manuales_frontend.md`

## Requereix del backend
Tots els passos del backend fins al 25.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F27 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 28 "[Frontend] Revisió d'accessibilitat i responsive" <<'EOF_ISSUE'
## Objectiu
Comprovar que l'aplicació es pot usar amb teclat, lector de pantalla i en pantalles xicotetes.

## Tasques
- [ ] Revisar etiquetes, focus, contrast, rols ARIA i ordre de tabulació
- [ ] Passar Lighthouse (accessibilitat) a les pantalles principals
- [ ] Corregir els problemes trobats

## Criteris d'acceptació
- [ ] Lighthouse d'accessibilitat ≥ 90 al login, a les ordres del client i a les sol·licituds del taller
- [ ] Es pot completar el login i una sol·licitud només amb teclat
- [ ] No hi ha scroll horitzontal a 360 px d'ample

## Requereix del backend
Cap.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F28 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 29 "[Fullstack] (Opcional) Servir el frontend compilat des de Spring Boot" <<'EOF_ISSUE'
## Objectiu
Compilar Angular i servir-lo des de Spring Boot, de manera que tot l'aplicació s'execute amb un únic servidor.

## Tasques
- [ ] Crear l'script `scripts/build-frontend.sh` (al repositori del frontend) que compila Angular i copia el resultat a `src/main/resources/static/` del repositori del backend
- [ ] Al repositori del backend: afegir un controlador que reenvie les rutes de l'aplicació a `index.html`
- [ ] Ajustar `SecurityConfig` perquè els recursos estàtics siguen públics i l'API continue protegida
- [ ] Ignorar `src/main/resources/static/` al `.gitignore` del backend

## Criteris d'acceptació
- [ ] `http://localhost:8080/` mostra l'aplicació Angular
- [ ] Recarregar `/cliente/ordenes` no dona 404
- [ ] `/api/v1/...` continua protegida (401 sense token)
- [ ] `src/main/resources/static/` no es puja a Git

## Fitxers i components
- `scripts`: `build-frontend.sh`
- `controller`: `SpaForwardController`

## Requereix del backend
Pas 9 (`SecurityConfig`) i el backend complet.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F29 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

crear 30 "[Frontend] README del frontend i documentació d'execució conjunta" <<'EOF_ISSUE'
## Objectiu
Documentar com instal·lar, arrancar, provar i compilar el frontend, i com executar backend i frontend junts.

## Tasques
- [ ] Substituir el `README.md` generat per Angular pel de MotorLab
- [ ] Afegir al mateix README la secció de com arrancar backend i frontend

## Criteris d'acceptació
- [ ] Algú que clone el repositori pot arrancar backend i frontend seguint només els README

## Fitxers i components
- `arrel`: `README.md`

## Requereix del backend
Cap.

## Depèn de
__PREV__ (pas anterior del frontend).

## Guia
Pas F30 de `docs/guia_github_frontend_motorlab.md`.
EOF_ISSUE

echo ""
echo "Fet: 30 issues creades. Números a issues_frontend.txt"
