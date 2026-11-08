# MotorLab · Guia del frontend (Angular) pas a pas amb GitHub

**Projecte:** MotorLab · **Autor:** Pablo Ruiz Gandia · **Stack:** Angular · TypeScript · SCSS · signals · formularis reactius
**Terminal:** Git Bash · **IDE:** Visual Studio Code · **API:** Spring Boot (`/api/v1`) · **Carpeta:** el frontend té el **seu propi repositori** (separat del backend); el projecte Angular està a l'arrel d'eixe repositori

Esta guia és la germana de `guia_github_backend_motorlab.md`: el treball del frontend està partit en **30 apartats xicotets** (de F01 a F30), en **ordre real d'execució** (el primer és crear el projecte Angular), i cadascun té:

- una **issue** (títol i descripció),
- una **branca**,
- un **commit**,
- una **pull request** (títol i descripció, amb `Closes #N`),
- els **prompts** per a Copilot (en mode Agent), en ordre, i la **comprovació**.

Tot el que fa peticions està construït sobre l'API real del backend. La referència completa (tipus, endpoints, rols, errors i validacions) és **`Motorlab_Api.md`** (v1.2), que has de guardar a `docs/`. Està alineada amb l'OpenAPI que genera el backend (**`MotorLab-API.json`**, també a `docs/`); si els dos no coincidixen, **mana el JSON**. Els prompts els llegixen amb `#file:docs/Motorlab_Api.md` i `#file:docs/MotorLab-API.json`.

> **Important:** el JSON de l'API usa **`camelCase`** (`totalPaginas`, `tipoServicio`, `mecanicoId`, `soloActivas`…). Les versions anteriors d'esta guia deien `snake_case`. Els valors dels enumerats continuen amb guió baix (`aceite_filtros`, `mano_obra`). El pas F02 té una comprovació amb `curl` per a confirmar-ho amb el teu backend.

## Què necessites tindre a mà

| Fitxer | On va |
|---|---|
| `Motorlab_Api.md` | `docs/` |
| `MotorLab-API.json` (l'OpenAPI descarregat del backend) | `docs/` |
| `maquetas_motorlab.zip` (descomprimit: `fig03-login.png` … `fig14-panel.png`) | `docs/maquetas/` |
| `crear_issues_frontend_motorlab.sh` (opcional, crea les 30 issues) | arrel del repositori |
| esta guia | `docs/` |

## Regla d'or: una issue = una branca = un commit = una PR

Els passos depenen els uns dels altres: **fusiona cada PR abans de començar el següent**. El nom de la branca és `feature/fe-NN-nom` (`fe` = *frontend*).

### Flux de cada pas

```bash
# 1) Parteix sempre de main actualitzada
git checkout main
git pull

# 2) Crea la branca del pas (el nom està a la guia)
git checkout -b feature/fe-NN-nom-del-pas

# 3) Executa els prompts en ordre, compila i fes la comprovació

# 4) Commit i push (el missatge està a la guia)
git add .
git commit -m "missatge del commit"
git push -u origin feature/fe-NN-nom-del-pas

# 5) A GitHub: Compare & pull request → enganxa el títol i la descripció de la guia
#    Revisa els canvis, fes «Squash and merge» i esborra la branca

# 6) Torna a main i neteja
git checkout main
git pull
git branch -d feature/fe-NN-nom-del-pas
```

## Com funcionen els números de les issues (i el `Closes #N`)

El frontend té un repositori propi, així que les seues issues i PR tenen **numeració pròpia** (començant per #1). Dins d'un mateix repositori **GitHub compartix la numeració** entre issues i PR, per això **no pots saber d'avant el número** de cada issue. Fes-ho així:

1. **Crea totes les issues del frontend d'una vegada** abans de començar. La manera més còmoda és l'**Annex C**: l'script `crear_issues_frontend_motorlab.sh` les crea en ordre i guarda els números reals a `issues_frontend.txt` (afig este fitxer al `.gitignore`).
2. Si les crees a mà, apunta el número de cada una a la taula següent.
3. A cada PR, canvia `Closes #N` pel número de la issue d'eixe pas. Per a consultar-lo: `grep '^F05 ' issues_frontend.txt` (en este exemple, el pas F05).
4. `Closes #N` només tanca la issue quan la PR es **fusiona a `main`**.

## Requisits (una sola vegada, sense issue)

- El backend funcionant (almenys fins al pas que requerisca cada apartat; cada pas diu quin necessita).
- Node.js LTS, npm i Git. Verifica-ho:

```bash
node -v
npm -v
git --version
```

- Per a provar amb dades reals, el backend arrancat amb el perfil `local`:

```bash
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run
```

## Com usar els prompts

1. Obri VS Code a l'arrel del repositori i el xat de Copilot en mode **Agent** (el selector del costat del camp de text; en mode *Ask* només mostra codi). Quan acabe, revisa els fitxers canviats (`Ctrl+Shift+G`) i prem **Keep**.
2. Comença **cada conversa nova** amb el **Prompt 0 del frontend** (el guardes al pas F01 a `.github/instructions/frontend.instructions.md`, perquè Copilot l'aplique als fitxers d'Angular).
3. Executa els prompts **en ordre i d'un en un**. Els prompts es numeren per pas: el *Prompt F12.2* és el segon del pas F12.
4. Als prompts que citen una figura (Figura 3, 4…), adjunta la imatge de `docs/maquetas/` al xat perquè Copilot veja el disseny.
5. **Revisa el codi** abans d'acceptar-lo: ha de complir les regles del Prompt 0. Entendre'l és part de la defensa.
6. Després de cada prompt, compila: `npm run build` (des de l'arrel). Si falla, usa el **Prompt de correcció**.

### Prompt 0 · Context del frontend (comença cada conversa amb ell)

```text
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
```

### Prompt de correcció (quan alguna cosa no compila o falla)

```text
Al ejecutar `npm run build` (o `npm start`) me sale este error:

<pega aquí el error completo>

Explícame la causa en dos líneas y corrige solo los archivos afectados, respetando las reglas del proyecto.
```

## Mapa de pantalles, rutes i endpoints

| Ruta | Pantalla | Rol | Endpoints principals | Pas |
|---|---|---|---|---|
| `/login`, `/registro` | Login i registre | públic | `POST /auth/login`, `POST /auth/registro` | F10 |
| `/cliente/vehiculos` (+ `/nuevo`, `/:id/editar`) | Els meus vehicles | client | `GET/POST/PUT/DELETE /vehiculos` | F12 |
| `/cliente/vehiculos/:id/historial` | Historial del vehicle | client | `GET /vehiculos/{id}/historial` | F14 |
| `/cliente/solicitud/nueva` | Nova sol·licitud (3 passos) | client | `POST /ordenes` | F13 |
| `/cliente/ordenes` | Les meues ordres | client | `GET /ordenes` | F14 |
| `/cliente/ordenes/:id` | Detall i seguiment | client | `GET /ordenes/{id}`, `/seguimiento`, `POST /cancelar` | F15 |
| `/cliente/ordenes/:id/presupuesto` | Pressupost (autoritzar o rebutjar) | client | `GET /ordenes/{id}/presupuesto`, `POST /presupuestos/{id}/autorizar` i `/rechazar` | F16 |
| `/cliente/avisos`, `/taller/avisos` | Avisos | tots | `GET /notificaciones`, `/contador`, `PATCH /leida` | F17 |
| `/cliente/perfil` | Perfil | client | `GET /auth/yo` | F18 |
| `/taller/solicitudes` | Llistat de sol·licituds | admin | `GET /ordenes`, `GET /usuarios` | F19 |
| `/taller/ordenes/:id` | Detall de l'ordre | admin | `PATCH /asignacion`, `PATCH /estado`, `POST /presupuesto` | F20 |
| `/taller/ordenes/:id/presupuesto` | Editor de pressupost | admin | `/presupuestos/{id}/lineas`, `/enviar`, `GET /piezas` | F21 |
| `/taller/piezas` | Catàleg de peces | admin, mecànic | `GET/POST/PUT/DELETE /piezas`, `PATCH /stock` | F22 |
| `/taller/mis-ordenes` (+ `/:id`) | Vista del mecànic | mecànic | `GET /ordenes`, `PATCH /estado`, `GET /presupuesto` | F23 |
| `/taller/usuarios` | Gestió d'usuaris | admin | `GET/POST/PATCH /usuarios` | F24 |
| `/taller/panel` | Panell de mètriques | admin | `GET /panel/metricas` | F25 |
| `/403`, `/404` | Errors | tots | — | F26 |

## Resum dels 30 apartats

| Pas | Issue | Branca | Commit | Nº issue |
|---|---|---|---|---|
| F01 | [Frontend] Crear el projecte Angular a l'arrel del repositori | `feature/fe-01-projecte-angular` | `chore(frontend): crea el projecte Angular amb routing i SCSS` |   |
| F02 | [Frontend] Configuració base: proxy, entorns i estructura de carpetes | `feature/fe-02-configuracio-base` | `feat(frontend): proxy cap al backend, entorns i estructura de carpetes` |   |
| F03 | [Frontend] Estils globals i tokens de disseny (SCSS) | `feature/fe-03-estils-globals` | `feat(frontend): estils globals i tokens de disseny` |   |
| F04 | [Frontend] Models TypeScript de l'API i lògica d'estats | `feature/fe-04-models-estats` | `feat(frontend): models de l'API, etiquetes i lògica de transicions d'estat` |   |
| F05 | [Frontend] Servei d'autenticació amb signals i emmagatzematge del token | `feature/fe-05-servei-autenticacio` | `feat(frontend): servei d'autenticació amb signals i token persistent` |   |
| F06 | [Frontend] Interceptors d'autenticació i d'errors | `feature/fe-06-interceptors` | `feat(frontend): interceptors d'autenticació i d'errors amb ApiError` |   |
| F07 | [Frontend] Toasts, idioma (es-ES) i pipes d'imports i dates | `feature/fe-07-toasts-locale-pipes` | `feat(frontend): toasts, locale es-ES i pipes d'imports i dates` |   |
| F08 | [Frontend] Components d'UI reutilitzables (pills, progrés, paginador, modal i errors de camp) | `feature/fe-08-components-ui` | `feat(frontend): components d'UI reutilitzables` |   |
| F09 | [Frontend] Guards d'autenticació i de rol, i esquelet de rutes | `feature/fe-09-guards-rutes` | `feat(frontend): guards d'autenticació i de rol, i rutes de l'aplicació` |   |
| F10 | [Frontend] Pàgines de login i de registre amb formularis reactius | `feature/fe-10-login-registre` | `feat(auth): pàgines de login i de registre amb formularis reactius` |   |
| F11 | [Frontend] Layouts de la zona del client (mòbil) i del taller (escriptori) | `feature/fe-11-layouts` | `feat(frontend): layouts de la zona del client i del taller` |   |
| F12 | [Frontend] Vehicles del client: llistat, alta, edició i baixa | `feature/fe-12-vehicles` | `feat(vehiculos): llistat, alta, edició i baixa de vehicles` |   |
| F13 | [Frontend] Servei d'ordres i formulari de nova sol·licitud de reparació | `feature/fe-13-solicitud-nova` | `feat(ordenes): servei d'ordres i formulari de nova sol·licitud` |   |
| F14 | [Frontend] Llistat d'ordres del client i historial del vehicle | `feature/fe-14-ordres-client` | `feat(ordenes): llistat d'ordres del client i historial del vehicle` |   |
| F15 | [Frontend] Detall i seguiment de l'ordre per al client (línia de temps) | `feature/fe-15-detall-seguiment` | `feat(ordenes): detall i seguiment de l'ordre amb línia de temps` |   |
| F16 | [Frontend] Pressupost del client: consultar, autoritzar i rebutjar | `feature/fe-16-pressupost-client` | `feat(presupuestos): pressupost del client amb autoritzar i rebutjar` |   |
| F17 | [Frontend] Notificacions: contador, llistat i marcar com a llegides | `feature/fe-17-notificacions` | `feat(notificaciones): comptador, llistat i lectura d'avisos` |   |
| F18 | [Frontend] Perfil de l'usuari i tancament de sessió | `feature/fe-18-perfil` | `feat(perfil): pàgina de perfil amb tancament de sessió` |   |
| F19 | [Frontend] Taller: serveis d'usuaris i llistat de sol·licituds amb filtres | `feature/fe-19-taller-solicituds` | `feat(taller): llistat de sol·licituds amb filtres i paginació` |   |
| F20 | [Frontend] Taller: detall de l'ordre, assignació, canvi d'estat i cancel·lació | `feature/fe-20-taller-detall-ordre` | `feat(taller): detall de l'ordre amb assignació, estats i creació de pressupost` |   |
| F21 | [Frontend] Taller: editor de pressupost amb línies, peces i totals | `feature/fe-21-taller-editor-pressupost` | `feat(taller): editor de pressupost amb línies, totals i enviament` |   |
| F22 | [Frontend] Taller: catàleg de peces i gestió d'stock | `feature/fe-22-taller-peces` | `feat(taller): catàleg de peces i ajust d'stock` |   |
| F23 | [Frontend] Mecànic: les meues ordres i canvi d'estat de la reparació | `feature/fe-23-taller-mecanic` | `feat(taller): vista del mecànic amb canvi d'estat i avís d'stock` |   |
| F24 | [Frontend] Taller: gestió d'usuaris (administrador) | `feature/fe-24-taller-usuaris` | `feat(taller): gestió d'usuaris per a l'administrador` |   |
| F25 | [Frontend] Taller: panell de mètriques | `feature/fe-25-taller-panell` | `feat(taller): panell de mètriques amb indicadors i barres per estat` |   |
| F26 | [Frontend] Pàgines d'error (403, 404), gestor global d'errors i neteja de la pàgina de mostra | `feature/fe-26-errors-globals` | `feat(frontend): pàgines 403 i 404, gestor global d'errors i neteja` |   |
| F27 | [Frontend] Proves manuals de la demostració completa amb els tres rols | `feature/fe-27-proves-manuals` | `test(frontend): casos de prova manuals de la demostració completa` |   |
| F28 | [Frontend] Revisió d'accessibilitat i responsive | `feature/fe-28-accessibilitat` | `fix(frontend): accessibilitat i responsive` |   |
| F29 | [Fullstack] (Opcional) Servir el frontend compilat des de Spring Boot | `feature/fe-29-servir-des-de-spring` | `feat(fullstack): servir el frontend compilat des de Spring Boot` |   |
| F30 | [Frontend] README del frontend i documentació d'execució conjunta | `feature/fe-30-readme-frontend` | `docs(frontend): README del frontend i execució conjunta` |   |

La darrera columna és per a apuntar el número real de cada issue quan la crees.

---

## Pas F01 · Crear el projecte Angular

> **Requereix del backend:** Cap (encara no fa peticions).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Crear el projecte Angular a l'arrel del repositori` |
| **Branca** | `feature/fe-01-projecte-angular` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
```

```bash
git checkout main
git pull
git checkout -b feature/fe-01-projecte-angular
```

### Què es crea

- **arrel**: `package.json`, `angular.json`, `tsconfig.json`, `src/`

### Execució (en ordre)

#### Crea el repositori i el projecte Angular

El frontend va en un repositori **independent** del backend, així que l'arrel és la d'eixe repositori.

**1. Crea el repositori a GitHub** (per exemple `motorlab-frontend`, buit i sense README) i clona'l **fora** de la carpeta del backend:

```bash
cd <carpeta-on-guardes-els-projectes>
git clone https://github.com/<el-teu-usuari>/motorlab-frontend.git
cd motorlab-frontend
```

**2. Genera el projecte Angular dins del repositori.** `ng new` crea una carpeta nova; el generem a una carpeta temporal i el pugem un nivell perquè el nom del projecte siga `motorlab` (eixe nom surt a `angular.json` i a la ruta `dist/motorlab/browser` del pas F29):

```bash
npm i -g @angular/cli
ng version
ng new motorlab --routing --style=scss --skip-git --ssr=false
cp -rn motorlab/. .
rm -rf motorlab
```

- **`--skip-git`**: el Git ja és el del repositori clonat; sense això Angular crearia un segon `.git`.
- Si el CLI et fa preguntes opcionals (SSR, zoneless, eines d'IA…), respon **que no** o deixa els valors per defecte.
- Si el repositori ja tenia un `README.md` o `.gitignore`, `cp -n` no els sobreescriu: afig tu a mà les línies d'Angular que falten (`node_modules/`, `/dist/`, `/.angular/`).

**3. Arranca:**

```bash
npm start
```

Obri `http://localhost:4200`.

#### Instruccions per a l'assistent (frontend)

Crea el fitxer `.github/instructions/frontend.instructions.md` amb esta capçalera i, a sota, **el text complet del Prompt 0 del frontend** (apartat «Prompt 0» d'esta guia):

```markdown
---
applyTo: "**"
---
<enganxa ací el Prompt 0 del frontend>
```

Així Copilot aplica estes regles a tot el repositori del frontend. Si la teua versió no admet fitxers `.instructions.md`, afig el text al final de `.github/copilot-instructions.md`.

#### Documents de referència

| Fitxer | Destí |
|---|---|
| `Motorlab_Api.md` | `docs/` |
| `MotorLab-API.json` (l'OpenAPI descarregat del backend) | `docs/` |
| `maquetas_motorlab.zip` (descomprimit) | `docs/maquetas/` |
| esta guia | `docs/` |

Les maquetes `fig03-login.png` … `fig14-panel.png` corresponen a les Figures 3–14 de la proposta. Al xat de Copilot pots adjuntar la imatge de la pantalla que vas a construir (arrossegar-la o `#file`).

Per a tornar a descarregar el JSON amb el backend arrancat: `curl http://localhost:8080/v3/api-docs -o docs/MotorLab-API.json`.

### Comprovació

```bash
npm start
npm run build
ls -d .git        # un únic .git, el de l'arrel
git status
```
Mira que `git status` no mostre `node_modules/` ni `.angular/`.

### Commit, push i pull request

```bash
git add .
git commit -m "chore(frontend): crea el projecte Angular amb routing i SCSS"
git push -u origin feature/fe-01-projecte-angular
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Projecte Angular base` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F01 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear el repositori del frontend a GitHub i clonar-lo en local
- [x] Instal·lar Angular CLI i generar el projecte a l'arrel del repositori (routing, SCSS)
- [x] Crear `.github/instructions/frontend.instructions.md` amb el Prompt 0 del frontend
- [x] Copiar `Motorlab_Api.md` i `MotorLab-API.json` a `docs/` i les maquetes a `docs/maquetas/`
- [x] Comprovar que l'aplicació arranca i compila

## Com provar-ho
- `npm start` mostra l'aplicació a `http://localhost:4200`
- `npm run build` acaba sense errors
- El repositori té un únic `.git` (a l'arrel) i `node_modules/` i `.angular/` no apareixen a `git status`
- Existeixen `docs/Motorlab_Api.md`, `docs/MotorLab-API.json` i `docs/maquetas/`

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-01-projecte-angular`

---

## Pas F02 · Configuració base del frontend

> **Requereix del backend:** Cap per a configurar-ho; per a comprovar el proxy, el backend arrancat (pas 9 del backend).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Configuració base: proxy, entorns i estructura de carpetes` |
| **Branca** | `feature/fe-02-configuracio-base` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F01.

## Guia
Pas F02 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-02-configuracio-base
```

### Què es crea

- **arrel**: `proxy.conf.json`, `environment.ts`, `environment.development.ts`

### Execució (en ordre)

#### Prompt F2.1 · Proxy, entorns i HttpClient

```text
En la raíz del proyecto (donde está angular.json) configura lo siguiente (no cambies nada más):
1. Crea proxy.conf.json que redirija /api a http://localhost:8080 (secure: false, changeOrigin: true) y regístralo en angular.json en el objetivo serve (proxyConfig), de modo que `npm start` ya use el proxy.
2. Crea los entornos (con `ng generate environments` o a mano si tu versión no lo trae): environment.ts (producción) y environment.development.ts, ambos con apiUrl: '/api/v1', y configura los fileReplacements en angular.json.
3. En src/app/app.config.ts añade provideHttpClient(withInterceptors([])) (los interceptores se añadirán más adelante) y mantén provideRouter(routes).
4. Comprueba que package.json tiene los scripts start, build, test y añade build:prod = "ng build --configuration production".
Explícame qué has cambiado en cada archivo.
```

#### Prompt F2.2 · Estructura de carpetas y alias

```text
Crea la estructura de carpetas de src/app, con un archivo .gitkeep en cada carpeta vacía:
core/models, core/services, core/interceptors, core/guards, core/util,
shared/components, shared/pipes, layouts,
features/auth, features/vehiculos, features/ordenes, features/presupuestos, features/notificaciones, features/perfil,
features/taller/solicitudes, features/taller/orden-detalle, features/taller/presupuesto-editor, features/taller/mecanico, features/taller/piezas, features/taller/usuarios, features/taller/panel.
En tsconfig.json (compilerOptions.paths) configura los alias @core/*, @shared/*, @layouts/*, @features/* y @env/* apuntando a src/app/core/*, src/app/shared/*, src/app/layouts/*, src/app/features/* y src/environments/*. Asegúrate de que strict está a true y de que `npm run build` sigue compilando.
```

### Comprovació

Amb el backend arrancat (veges la comprovació de la guia) i el frontend amb `npm start`:

```bash
curl -i http://localhost:4200/api/v1/auth/yo     # 401 amb JSON d'error de Spring
npm run build
```

**Comprovació del format de l'API (camelCase).** Esta prova decidix si els tipus de F04 són correctes. Fes-la amb el backend arrancat (perfil `local`) i el frontend amb `npm start`; la contrasenya és la de `app.dev.password-semilla` del teu `application-local.properties` (no l'escrigues en cap fitxer):

```bash
read -s -p "Contrasenya de la llavor: " PW; echo
TOKEN=$(curl -s -X POST http://localhost:4200/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@taller.example\",\"password\":\"$PW\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/')
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4200/api/v1/vehiculos?limite=1"; echo
curl -s -X POST http://localhost:4200/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@taller.example","password":"mala-contrasenya"}'; echo
unset PW TOKEN
```

- La segona resposta ha de dur **`"totalPaginas"`** (camelCase) i `"datos"`. Si veus **`"total_paginas"`**, el teu backend encara emet `snake_case`: o bé lleves `spring.jackson.property-naming-strategy=SNAKE_CASE` del backend i el reinicies, o bé torna a descarregar el JSON (`curl http://localhost:8080/v3/api-docs -o docs/MotorLab-API.json`) i avisa'm perquè adapte la guia.
- La tercera resposta (contrasenya errònia) ha de tindre la forma `{"error":{"codigo":"NO_AUTENTICADO","mensaje":"Credenciales incorrectas"...}}`. Si el cos és un altre, ajusta `ApiErrorBody` al pas F04.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): proxy cap al backend, entorns i estructura de carpetes"
git push -u origin feature/fe-02-configuracio-base
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Configuració base del frontend` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F02 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `proxy.conf.json` i configurar `npm start` perquè l'use
- [x] Crear els entorns amb `apiUrl: '/api/v1'`
- [x] Registrar `provideHttpClient` a `app.config.ts`
- [x] Crear l'estructura de carpetes (`core`, `shared`, `layouts`, `features`) i els àlies de TypeScript

## Com provar-ho
- Amb el backend arrancat, `curl -i http://localhost:4200/api/v1/auth/yo` torna **401** amb JSON de Spring (el proxy funciona)
- `npm run build` sense errors
- Existeixen les carpetes de `src/app` amb el seu `.gitkeep`

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-02-configuracio-base`

---

## Pas F03 · Estils globals i tokens de disseny

> **Requereix del backend:** Cap.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Estils globals i tokens de disseny (SCSS)` |
| **Branca** | `feature/fe-03-estils-globals` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F02.

## Guia
Pas F03 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-03-estils-globals
```

### Què es crea

- **styles**: `_tokens.scss`, `_base.scss`, `_componentes.scss`, `styles.scss`
- **features/estilos**: `EstilosComponent`

### Execució (en ordre)

#### Prompt F3.1 · Tokens, base i components d'estil

```text
Crea en src/styles los archivos SCSS del sistema de diseño de MotorLab (basado en las maquetas de docs/maquetas, Figuras 3 a 14), con variables CSS en :root y SCSS (@use, nada de @import):

1. _tokens.scss, con estos colores y escalas:
   --mo-naranja #E8651A, --mo-naranja-claro #FDEBDD, --mo-noche #1B1C2B, --mo-fondo #F4F5F7, --mo-texto #15151C, --mo-gris #7C808C, --mo-linea #E4E6EB, --mo-verde #1FA463, --mo-verde-claro #E3F5EB, --mo-rojo #E5383B, --mo-rojo-claro #FDE8E8, --mo-ambar #8A5E06, --mo-ambar-claro #FFF1D0, --mo-azul #2F6FDE, --mo-azul-claro #E5EEFD.
   Escala de espaciado (4, 8, 12, 16, 24, 32), radios (8 px, 12 px, 999 px), sombras suaves y escala tipográfica (12, 13, 14, 16, 21, 26 px). Familia: 'Inter' con tipografías del sistema como respaldo.
2. _base.scss: reset mínimo, body con fondo --mo-fondo y color --mo-texto, estilos de foco visibles (:focus-visible con contorno naranja), clase .sr-only y títulos.
3. _componentes.scss: clases reutilizables
   - .btn con variantes .btn--primario (naranja), .btn--secundario (borde), .btn--peligro, .btn--fantasma (borde discontinuo naranja), tamaño táctil de 44 px mínimo y estado disabled.
   - .pill con variantes .pill--naranja, --verde, --rojo, --ambar, --azul y --gris (etiquetas de estado y urgencia).
   - .tarjeta (fondo blanco o --mo-fondo, radio 12 px), .campo (label + input/select/textarea + mensaje de error), .campo--error, .segmentado (botones tipo Sí/No/No lo sé), .chips (selección tipo chip), .tabla (cabecera gris, filas con borde), .barra-progreso, .aviso (variantes info, ámbar y rojo) y .vacio.
4. styles.scss: importa los tres con @use.
```

#### Prompt F3.2 · Tipografía y página de muestra

```text
1. Instala la tipografía con `npm i @fontsource/inter` y en src/styles.scss importa los pesos 400, 600, 700 y 800 (solo latin y latin-ext).
2. Crea una página de muestra EstilosComponent en src/app/features/estilos/ y regístrala en app.routes.ts en la ruta '/estilos' con loadComponent. Debe enseñar todos los colores (con su nombre y valor), los botones en todas sus variantes y estados, las pills, las tarjetas, los campos (normal, con error y deshabilitado), el segmentado, los chips, una tabla de ejemplo, la barra de progreso y los avisos. Añade un comentario TODO que indique que esta ruta se elimina en el paso de errores globales y que solo existe en desarrollo.
```

Si Copilot no sabe cómo importar la fuente, la instalación es `npm i @fontsource/inter` y los `import '@fontsource/inter/400.css';` van en `styles.scss` (o en `angular.json`, en `styles`).

### Comprovació

```bash
npm start
```
Obri `http://localhost:4200/estilos` i compara amb les maquetes: naranja `#E8651A`, barra lateral `#1B1C2B`, pills arrodonides i targetes clares. Prem `Tab` per a comprovar el focus.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): estils globals i tokens de disseny"
git push -u origin feature/fe-03-estils-globals
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Estils globals i tokens de disseny` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F03 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear els tokens (`_tokens.scss`), la base (`_base.scss`) i els components d'estil (`_components.scss`)
- [x] Instal·lar la tipografia Inter amb `@fontsource/inter`
- [x] Crear una pàgina de mostra `/estilos` (només per a desenvolupament)

## Com provar-ho
- La pàgina `/estilos` mostra colors, botons, etiquetes, targetes i camps amb l'aspecte de les maquetes
- El focus de teclat es veu en tots els elements interactius
- `npm run build` sense errors

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-03-estils-globals`

---

## Pas F04 · Models TypeScript i lògica d'estats

> **Requereix del backend:** Cap (només tipus i lògica).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Models TypeScript de l'API i lògica d'estats` |
| **Branca** | `feature/fe-04-models-estats` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F03.

## Guia
Pas F04 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-04-models-estats
```

### Què es crea

- **core/models**: `tipos.model.ts`, `usuario.model.ts`, `vehiculo.model.ts`, `orden.model.ts`, `presupuesto.model.ts`, `pieza.model.ts`, `notificacion.model.ts`, `panel.model.ts`, `pagina.model.ts`, `api-error.model.ts`, `etiquetas.ts`, `index.ts`
- **core/util**: `estados.ts`, `estados.spec.ts`

### Execució (en ordre)

#### Prompt F4.1 · Models de l'API

```text
Crea en src/app/core/models los tipos de TypeScript de la API, copiando EXACTAMENTE las interfaces y los tipos de #file:docs/Motorlab_Api.md (sección 2), con las propiedades en camelCase y sin renombrar nada. Contrasta los nombres y los tipos con los esquemas de #file:docs/MotorLab-API.json (components.schemas) y, si hay diferencias, sigue el JSON. Un archivo por dominio: tipos.model.ts (los tipos enumerados: Rol, TipoServicio, CuandoOcurre, ConduccionSegura, Urgencia, FranjaPreferida, ContactoPreferido, EstadoOrden, EstadoPresupuesto, TipoLinea, TipoNotificacion), usuario.model.ts, vehiculo.model.ts, orden.model.ts, presupuesto.model.ts, pieza.model.ts, notificacion.model.ts, panel.model.ts, pagina.model.ts (Pagina<T>) y api-error.model.ts (ApiErrorBody). Crea un index.ts que reexporte todo, de modo que se pueda importar desde '@core/models'.
```

#### Prompt F4.2 · Etiquetas, estados y transiciones

```text
1. En src/app/core/models/etiquetas.ts crea los objetos Record con las etiquetas en castellano:
   - ETIQUETAS_ESTADO: solicitud_recibida «Solicitud recibida», pendiente_presupuesto «Pendiente de presupuesto», presupuesto_enviado «Presupuesto enviado», presupuesto_autorizado «Presupuesto autorizado», recibido «Recibido», en_preparacion «En preparación», esperando_pieza «Esperando pieza», arreglando «Arreglando», listo «Listo para recoger», entregado «Entregado», rechazada «Presupuesto rechazado», cancelada «Cancelada».
   - ETIQUETAS_URGENCIA (baja, media, alta), ETIQUETAS_TIPO_SERVICIO (frenos «Frenos», motor «Motor», aceite_filtros «Aceite y filtros», neumaticos «Neumáticos», electricidad «Electricidad», itv «ITV», otro «Otro»), ETIQUETAS_CUANDO_OCURRE, ETIQUETAS_CONDUCCION_SEGURA (si «Sí», no «No», no_se «No lo sé»), ETIQUETAS_FRANJA (manana «Mañana», tarde «Tarde»), ETIQUETAS_CONTACTO (telefono «Teléfono», email «Correo electrónico»), ETIQUETAS_ESTADO_PRESUPUESTO y ETIQUETAS_ROL.
2. En src/app/core/util/estados.ts crea, según la sección 4 de #file:docs/Motorlab_Api.md:
   - ESTADOS_FINALES = entregado, rechazada, cancelada; ESTADOS_ACTIVOS = todos los demás.
   - ESTADOS_MECANICO = en_preparacion, esperando_pieza, arreglando, listo.
   - ESTADOS_AUTOMATICOS = presupuesto_enviado, presupuesto_autorizado, rechazada, cancelada.
   - TRANSICIONES: Record<EstadoOrden, EstadoOrden[]> con las transiciones permitidas: solicitud_recibida -> pendiente_presupuesto, cancelada; pendiente_presupuesto -> presupuesto_enviado, cancelada; presupuesto_enviado -> presupuesto_autorizado, rechazada, cancelada; presupuesto_autorizado -> recibido, cancelada; recibido -> en_preparacion; en_preparacion -> esperando_pieza, arreglando; esperando_pieza -> arreglando; arreglando -> esperando_pieza, listo; listo -> entregado; entregado, rechazada y cancelada -> nada.
   - esEstadoFinal(estado) y siguientesEstados(estado, rol): para admin devuelve las transiciones sin los ESTADOS_AUTOMATICOS; para mecanico solo las que están en ESTADOS_MECANICO; para cliente, una lista vacía.
3. Crea estados.spec.ts con pruebas: las siguientes de arreglando para mecanico son esperando_pieza y listo; para admin, desde presupuesto_autorizado solo recibido; desde entregado no hay ninguna; para cliente nunca hay.
```

### Comprovació

```bash
npm test -- --watch=false
npm run build
```
Les proves de `estados.spec.ts` han de passar. Compara les etiquetes i els tipus amb `docs/Motorlab_Api.md`.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): models de l'API, etiquetes i lògica de transicions d'estat"
git push -u origin feature/fe-04-models-estats
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Models de l'API i lògica d'estats` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F04 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear els models a `core/models` (copiant `docs/Motorlab_Api.md` i contrastant amb `docs/MotorLab-API.json`)
- [x] Crear les etiquetes en castellà de estats, urgències i serveis
- [x] Crear `core/util/estados.ts` (estats actius, finals, transicions) i la seua prova

## Com provar-ho
- `npm run build` sense errors
- Les proves passen: `siguientesEstados` respecta les transicions i els permisos per rol
- Les propietats dels models estan en camelCase, com el JSON

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-04-models-estats`

---

## Pas F05 · Servei d'autenticació

> **Requereix del backend:** Pas 9 (configuració de Spring Security), pas 10 (registre i login) i pas 11 (usuaris d'exemple).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Servei d'autenticació amb signals i emmagatzematge del token` |
| **Branca** | `feature/fe-05-servei-autenticacio` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F04.

## Guia
Pas F05 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-05-servei-autenticacio
```

### Què es crea

- **core/services**: `AuthService`, `auth.service.spec.ts`

### Execució (en ordre)

#### Prompt F5.1 · AuthService

```text
Crea src/app/core/services/auth.service.ts (AuthService, providedIn: 'root') según #file:docs/Motorlab_Api.md (sección «Autenticación»), con signals:
- usuario = signal<Usuario | null>(null) y token = signal<string | null>, leído de localStorage con la clave 'motorlab.token' al iniciar.
- estaAutenticado y rol como computed.
- login(email, password): POST `${environment.apiUrl}/auth/login`; guarda el token (signal y localStorage) y el usuario, y devuelve Observable<Usuario>.
- registro(datos: RegistroRequest): POST /auth/registro, devuelve Observable<Usuario>.
- cargarUsuario(): si hay token, GET /auth/yo y actualiza usuario; si responde 401, llama a cerrarSesion sin navegar. Regístralo como inicializador de la aplicación (provideAppInitializer, o APP_INITIALIZER si tu versión es anterior) en app.config.ts para restaurar la sesión al recargar.
- cerrarSesion(): borra token y usuario (signals y localStorage) y navega a /login con Router.
- Todo acceso a localStorage va dentro de try/catch (puede estar bloqueado).
Crea los tipos que falten (RegistroRequest, LoginRequest, LoginResponse) si no están en '@core/models'.
```

#### Prompt F5.2 · Prueba del servicio

```text
Crea src/app/core/services/auth.service.spec.ts con HttpTestingController (provideHttpClient + provideHttpClientTesting) y un Router simulado. Comprueba: login guarda el token y el usuario y los expone en los signals; login con 401 no guarda nada; registro hace el POST correcto; cargarUsuario sin token no hace peticiones; cargarUsuario con token llama a /auth/yo; cerrarSesion borra el token de localStorage y navega a /login.
```

### Comprovació

```bash
npm test -- --watch=false
npm run build
```

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): servei d'autenticació amb signals i token persistent"
git push -u origin feature/fe-05-servei-autenticacio
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Servei d'autenticació` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F05 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `AuthService` amb signals (`usuario`, `token`, `estaAutenticado`, `rol`)
- [x] Implementar `login`, `registro`, `cargarUsuario` i `cerrarSesion`
- [x] Restaurar la sessió en arrancar l'aplicació
- [x] Crear la prova `auth.service.spec.ts`

## Com provar-ho
- Les proves passen
- Després d'un login, el token queda guardat i es recupera en recarregar la pàgina
- `cerrarSesion` esborra el token i l'usuari i porta a `/login`

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-05-servei-autenticacio`

---

## Pas F06 · Interceptors i gestió d'errors HTTP

> **Requereix del backend:** Pas 9 (configuració de Spring Security) i pas 10 (registre i login).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Interceptors d'autenticació i d'errors` |
| **Branca** | `feature/fe-06-interceptors` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F05.

## Guia
Pas F06 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-06-interceptors
```

### Què es crea

- **core/util**: `api-error.ts`
- **core/interceptors**: `auth.interceptor.ts`, `error.interceptor.ts`, `auth.interceptor.spec.ts`, `error.interceptor.spec.ts`

### Execució (en ordre)

#### Prompt F6.1 · ApiError i utilitats

```text
Crea src/app/core/util/api-error.ts con:
- class ApiError extends Error con status (number), codigo (string), mensaje (string) y detalles (array de {campo, mensaje}, vacío por defecto), y métodos de ayuda: esValidacion(), esNoAutenticado(), esSinPermiso(), esNoEncontrado(), esConflicto() y detalleDe(campo).
- aApiError(err: unknown): ApiError que convierta un HttpErrorResponse en ApiError leyendo el cuerpo {"error": {"codigo","mensaje","detalles"}} de #file:docs/Motorlab_Api.md; si no hay cuerpo (status 0 o respuesta que no es JSON), usa el mensaje «No se puede conectar con el servidor» (status 0) o «Ha ocurrido un error inesperado».
- mensajeDeError(err: unknown): string que devuelva el mensaje de un ApiError.
```

#### Prompt F6.2 · Interceptores

```text
Crea los interceptores funcionales en src/app/core/interceptors/:
1. auth.interceptor.ts (HttpInterceptorFn): si la URL empieza por environment.apiUrl y existe el token en AuthService, clona la petición con la cabecera Authorization: Bearer <token>. No añade el token a /auth/login ni a /auth/registro.
2. error.interceptor.ts (HttpInterceptorFn): con catchError convierte cualquier HttpErrorResponse en un ApiError (con aApiError) y lo relanza con throwError. Si el status es 401 y la URL NO es /auth/login ni /auth/registro, llama a AuthService.cerrarSesion() y navega a /login con el queryParam returnUrl (la URL actual) antes de relanzar el error.
Regístralos en app.config.ts con provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])). Evita dependencias circulares con AuthService (usa inject() dentro de la función del interceptor).
```

#### Prompt F6.3 · Pruebas de los interceptores

```text
Crea auth.interceptor.spec.ts y error.interceptor.spec.ts con HttpTestingController. Comprueba: con token se añade Authorization a /api/v1/vehiculos; sin token no se añade; no se añade a /auth/login; un 400 con detalles llega al suscriptor como ApiError con codigo VALIDACION y sus detalles; un 401 en /api/v1/vehiculos llama a cerrarSesion y navega a /login con returnUrl; un 401 en /auth/login NO cierra sesión; un status 0 produce el mensaje «No se puede conectar con el servidor».
```

### Comprovació

```bash
npm test -- --watch=false
npm run build
```

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): interceptors d'autenticació i d'errors amb ApiError"
git push -u origin feature/fe-06-interceptors
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Interceptors d'autenticació i d'errors` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F06 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear la classe `ApiError` i les utilitats de `core/util/api-error.ts`
- [x] Crear `authInterceptor` (afig `Authorization: Bearer`) i `errorInterceptor`
- [x] Registrar-los a `app.config.ts`
- [x] Crear les proves dels interceptors

## Com provar-ho
- Les proves passen
- Una petició a l'API porta la capçalera `Authorization` quan hi ha token
- Un 401 en una petició protegida tanca la sessió i porta a `/login`; un 401 del propi login NO tanca la sessió

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-06-interceptors`

---

## Pas F07 · Notificacions visuals (toast), locale i pipes

> **Requereix del backend:** Cap (components de presentació).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Toasts, idioma (es-ES) i pipes d'imports i dates` |
| **Branca** | `feature/fe-07-toasts-locale-pipes` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F06.

## Guia
Pas F07 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-07-toasts-locale-pipes
```

### Què es crea

- **core/services**: `ToastService`
- **shared/components**: `ToastContenedorComponent`
- **shared/pipes**: `EurosPipe`, `FechaHoraPipe`

### Execució (en ordre)

#### Prompt F7.1 · Toasts

```text
Crea un sistema de avisos (toasts):
1. src/app/core/services/toast.service.ts (ToastService): signal con la lista de avisos {id, tipo: 'exito' | 'error' | 'info', mensaje}; métodos exito(msg), error(msg) e info(msg) que añaden un aviso y lo quitan solo a los 5 segundos, y quitar(id).
2. src/app/shared/components/toast-contenedor/toast-contenedor.component.ts (selector app-toast-contenedor): lista fija arriba a la derecha (en móvil, arriba y a ancho completo) con los avisos, con role="status" (aria-live="polite") y los colores de .pill/--mo-verde, --mo-rojo y --mo-azul. Botón para cerrar cada aviso.
3. Colócalo una vez en app.component.html (o el componente raíz).
```

#### Prompt F7.2 · Idioma español, pipes y errores globales

```text
1. En app.config.ts registra el locale español: registerLocaleData(localeEs) y provide LOCALE_ID con 'es-ES'.
2. Crea src/app/shared/pipes/euros.pipe.ts (EurosPipe, standalone, name 'euros'): number | null -> «256,52 €» con Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR'}); null o undefined devuelven «—».
3. Crea src/app/shared/pipes/fecha-hora.pipe.ts (FechaHoraPipe, name 'fechaHora'): recibe un string ISO («2026-10-12T09:14:00» o «2026-10-12») y un formato opcional ('corta' = dd/MM/yyyy, 'hora' = HH:mm, 'completa' = dd/MM/yyyy HH:mm); null devuelve «—». Parsea las fechas sin zona horaria como hora local, sin desplazamientos.
4. Modifica el errorInterceptor para que, cuando el ApiError tenga status 0 o 5xx, muestre un toast de error con el mensaje, sin impedir que el error llegue al suscriptor.
5. Añade pruebas para los dos pipes (euros: 256.52 -> «256,52 €», 0 -> «0,00 €», null -> «—»; fecha: «2026-10-12T09:14:00» con 'hora' -> «09:14»).
```

### Comprovació

```bash
npm test -- --watch=false
npm start
```
A `/estilos` (o on vulgues provar-ho) crida un toast i comprova que desapareix als 5 segons. Atura el backend i fes un login: ha d'eixir el toast d'error de connexió.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): toasts, locale es-ES i pipes d'imports i dates"
git push -u origin feature/fe-07-toasts-locale-pipes
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Toasts, locale i pipes` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F07 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `ToastService` i `ToastContenedorComponent`
- [x] Configurar el locale `es-ES`
- [x] Crear `EurosPipe` i `FechaHoraPipe`
- [x] Fer que l'interceptor d'errors mostre un toast en errors de xarxa i 5xx

## Com provar-ho
- Un toast d'èxit i un d'error apareixen i desapareixen soles als 5 segons
- `256.52` es mostra com `256,52 €` amb `EurosPipe`
- Parar el backend i fer una petició mostra el toast «No se puede conectar con el servidor»

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-07-toasts-locale-pipes`

---

## Pas F08 · Components d'UI reutilitzables

> **Requereix del backend:** Cap (components de presentació).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Components d'UI reutilitzables (pills, progrés, paginador, modal i errors de camp)` |
| **Branca** | `feature/fe-08-components-ui` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F07.

## Guia
Pas F08 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-08-components-ui
```

### Què es crea

- **shared/components**: `PillEstadoComponent`, `PillUrgenciaComponent`, `BarraProgresoComponent`, `CargandoComponent`, `VacioComponent`, `PaginadorComponent`, `ModalConfirmacionComponent`, `ErroresCampoComponent`

### Execució (en ordre)

#### Prompt F8.1 · Pills, progreso, cargando, vacío y paginador

```text
Crea en src/app/shared/components (standalone, OnPush, con sus .html y .scss, usando las clases de src/styles):
1. PillEstadoComponent (selector app-pill-estado): input estado (EstadoOrden); muestra ETIQUETAS_ESTADO[estado] con la variante: solicitud_recibida y presupuesto_enviado naranja/ámbar, pendiente_presupuesto y en_preparacion azul, presupuesto_autorizado, arreglando y listo verde, esperando_pieza ámbar, recibido azul, entregado gris, rechazada y cancelada rojo. También acepta un input estadoPresupuesto alternativo para EstadoPresupuesto (borrador gris, enviado ámbar, autorizado verde, rechazado rojo).
2. PillUrgenciaComponent: input urgencia; baja gris, media ámbar, alta roja, en mayúsculas. Que el estado nunca se indique solo con color: siempre hay texto.
3. BarraProgresoComponent: input progreso (0-100) con role="progressbar" y aria-valuenow; barra naranja y el porcentaje a la derecha opcional (input mostrarPorcentaje).
4. CargandoComponent: spinner accesible con texto «Cargando…» (aria-live).
5. VacioComponent: icono simple, input titulo y texto, y un <ng-content> para un botón de acción.
6. PaginadorComponent: inputs pagina, totalPaginas y total; output cambiarPagina (number); botones Anterior/Siguiente y «Página X de Y», deshabilitados en los extremos; se oculta si totalPaginas <= 1.
Añade ejemplos de todos en la página /estilos.
```

#### Prompt F8.2 · Modal de confirmación y errores de campo

```text
Crea en src/app/shared/components:
1. ModalConfirmacionComponent (selector app-modal-confirmacion) con el elemento <dialog> nativo: inputs abierto (boolean), titulo, mensaje, textoConfirmar (por defecto «Confirmar»), textoCancelar (por defecto «Cancelar») y peligro (boolean, botón rojo); outputs confirmar y cancelar; <ng-content> opcional para un campo extra (por ejemplo un motivo). Se cierra con Escape, el foco entra en el diálogo al abrirse y vuelve al botón que lo abrió al cerrarse.
2. ErroresCampoComponent (selector app-errores-campo): input control (AbstractControl) y input mensajes opcional (Record<string,string>); cuando el control es inválido y está touched o dirty, muestra un mensaje por cada error de validación en castellano: required «Este campo es obligatorio», email «Correo electrónico no válido», minlength, maxlength, min, max, pattern «Formato no válido» y el error de servidor (clave 'servidor', con el texto que traiga). Con role="alert".
Añade ejemplos en la página /estilos.
```

### Comprovació

```bash
npm start
npm run build
```
A `/estilos`: obri el modal, prem `Escape` i comprova que el focus torna al botó. Prova el paginador i les pills.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): components d'UI reutilitzables"
git push -u origin feature/fe-08-components-ui
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Components d'UI reutilitzables` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F08 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `PillEstadoComponent`, `PillUrgenciaComponent` i `BarraProgresoComponent`
- [x] Crear `CargandoComponent`, `VacioComponent` i `PaginadorComponent`
- [x] Crear `ModalConfirmacionComponent` i `ErroresCampoComponent`

## Com provar-ho
- Tots els components apareixen a `/estilos` amb exemples
- El modal es tanca amb `Escape` i retorna el focus al botó que l'ha obert
- `npm run build` sense errors

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-08-components-ui`

---

## Pas F09 · Guards i esquelet de rutes

> **Requereix del backend:** Pas 9 i 10 (autenticació) per a provar-ho.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Guards d'autenticació i de rol, i esquelet de rutes` |
| **Branca** | `feature/fe-09-guards-rutes` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F08.

## Guia
Pas F09 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-09-guards-rutes
```

### Què es crea

- **core/guards**: `authGuard`, `rolGuard`, `invitadoGuard`, `guards.spec.ts`
- **core/util**: `rutas.ts`
- **shared/components**: `PendienteComponent`
- **app**: `app.routes.ts`

### Execució (en ordre)

#### Prompt F9.1 · Guards

```text
Crea en src/app/core/guards (guards funcionales con inject()):
1. authGuard (CanActivateFn): si AuthService.estaAutenticado() es true, permite; si no, devuelve un UrlTree a /login con queryParams {returnUrl: state.url}.
2. rolGuard(rolesPermitidos: Rol[]) (fábrica que devuelve un CanActivateFn): si el usuario autenticado tiene uno de los roles, permite; si no, UrlTree a /403.
3. invitadoGuard (CanActivateFn): si ya hay sesión, redirige a la pantalla de inicio de su rol; si no, permite (para /login y /registro).
4. En src/app/core/util/rutas.ts: función pantallaInicio(rol: Rol): string que devuelva '/cliente/ordenes' para cliente, '/taller/solicitudes' para admin y '/taller/mis-ordenes' para mecanico.
5. guards.spec.ts: sin sesión authGuard redirige a /login con returnUrl; con rol cliente rolGuard(['admin']) redirige a /403; invitadoGuard con sesión de admin redirige a /taller/solicitudes.
```

#### Prompt F9.2 · Rutas de la aplicación

```text
Crea src/app/shared/components/pendiente/pendiente.component.ts (PendienteComponent): pantalla provisional con el texto «Pantalla en construcción». Define en src/app/app.routes.ts todas las rutas con carga perezosa (loadComponent) y los guards; las pantallas que aún no existen usan PendienteComponent y se sustituirán en cada paso:
- '/login' y '/registro': invitadoGuard (pantallas de auth, de momento Pendiente).
- '/cliente' (authGuard + rolGuard(['cliente']), layout de cliente pendiente) con los hijos: 'vehiculos', 'vehiculos/nuevo', 'vehiculos/:id/editar', 'vehiculos/:id/historial', 'solicitud/nueva', 'ordenes', 'ordenes/:id', 'ordenes/:id/presupuesto', 'avisos', 'perfil'; y redirección de '' a 'ordenes'.
- '/taller' (authGuard + rolGuard(['admin','mecanico']), layout de taller pendiente) con los hijos: 'solicitudes' y 'ordenes/:id', 'ordenes/:id/presupuesto', 'piezas', 'usuarios', 'panel' solo para admin (rolGuard(['admin'])); 'mis-ordenes' y 'mis-ordenes/:id' solo para mecanico; 'piezas' para admin y mecanico.
- '' redirige a pantallaInicio del rol si hay sesión, o a /login.
- '/403' y '/404' (Pendiente) y '**' redirige a /404.
Mantén la ruta '/estilos' de desarrollo.
```

### Comprovació

```bash
npm test -- --watch=false
npm start
```
Obri `http://localhost:4200/cliente/ordenes` sense sessió: ha de portar a `/login?returnUrl=...`.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): guards d'autenticació i de rol, i rutes de l'aplicació"
git push -u origin feature/fe-09-guards-rutes
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Guards i esquelet de rutes` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F09 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `authGuard`, `rolGuard` i `invitadoGuard`
- [x] Crear `redirigirSegunRol` (pantalla d'inici per rol)
- [x] Definir `app.routes.ts` amb totes les rutes (càrrega mandrosa) i un `PendienteComponent` provisional
- [x] Crear la prova dels guards

## Com provar-ho
- Sense sessió, qualsevol ruta protegida porta a `/login`
- Un client que entra a `/taller/...` va a `/403`
- Les proves dels guards passen

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-09-guards-rutes`

---

## Pas F10 · Pàgines de login i de registre

> **Requereix del backend:** Pas 10 (registre i login) i pas 11 (usuaris d'exemple).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Pàgines de login i de registre amb formularis reactius` |
| **Branca** | `feature/fe-10-login-registre` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F09.

## Guia
Pas F10 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-10-login-registre
```

### Què es crea

- **core/util**: `formularios.ts`, `validadores.ts`, `formularios.spec.ts`, `validadores.spec.ts`
- **features/auth**: `LoginComponent`, `RegistroComponent`, `login.component.spec.ts`, `registro.component.spec.ts`

### Execució (en ordre)

#### Prompt F10.1 · Utilidades de formularios

```text
Crea en src/app/core/util:
1. formularios.ts con aplicarErroresServidor(form: FormGroup, error: ApiError): para cada detalle de error.detalles cuyo campo coincida con el nombre de un control del formulario (los controles usan camelCase como el JSON), añade al control el error {servidor: detalle.mensaje} y márcalo touched; devuelve los detalles que no coincidan con ningún campo (para mostrarlos como mensaje general). También limpiarErroresServidor(form).
2. validadores.ts con validadores reutilizables: telefonoValidator (solo dígitos, espacios y +, entre 9 y 20 caracteres), passwordValidator (entre 8 y 72), verdaderoValidator (el valor debe ser true; para las casillas de privacidad) y fechaHoyOPosteriorValidator (una fecha 'YYYY-MM-DD' que no sea anterior a hoy, comparando fechas locales sin zona horaria).
3. formularios.spec.ts y validadores.spec.ts con pruebas.
```

#### Prompt F10.2 · Pantallas de login y registro

```text
Crea en src/app/features/auth (componentes standalone, formularios reactivos) siguiendo la maqueta de la Figura 3 (docs/maquetas/fig03-login.png):
1. LoginComponent (ruta /login): campos email y password (obligatorios), botón «Iniciar sesión», enlace a /registro. Al enviar llama a AuthService.login: si va bien, navega al returnUrl del queryParam o a pantallaInicio(rol); si falla con ApiError, muestra el mensaje en un aviso rojo sobre el formulario (para 401 «Credenciales incorrectas»). Mientras se envía, el botón queda deshabilitado con «Entrando…».
2. RegistroComponent (ruta /registro): campos nombre, email, telefono, password y aceptaPrivacidad (casilla), con las validaciones de la sección 5 de #file:docs/Motorlab_Api.md. Al enviar llama a AuthService.registro; si va bien, muestra un toast «Cuenta creada. Ya puedes iniciar sesión» y navega a /login. Los errores 400/409 del servidor se asignan a los campos con aplicarErroresServidor (EMAIL_DUPLICADO se muestra en el campo email) y los que no coincidan se muestran como aviso general.
Usa ErroresCampoComponent en cada campo. Sustituye las rutas Pendiente de /login y /registro por estos componentes.
```

#### Prompt F10.3 · Pruebas de las pantallas

```text
Crea login.component.spec.ts y registro.component.spec.ts: el formulario de login no se envía vacío; un login correcto llama a navegar a pantallaInicio; un 401 muestra «Credenciales incorrectas»; en el registro, una contraseña corta y un teléfono inválido muestran errores; un 409 EMAIL_DUPLICADO deja el error de servidor en el control email.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Prova:
1. `/login` amb `laura@cliente.example` → va a `/cliente/ordenes`.
2. Un login amb contrasenya errònia → missatge «Credenciales incorrectas».
3. `/registro` amb un email repetit → error al camp `email`.
4. Amb sessió, `/login` et redirigeix a la teua pantalla d'inici.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(auth): pàgines de login i de registre amb formularis reactius"
git push -u origin feature/fe-10-login-registre
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Login i registre` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F10 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `aplicarErroresServidor` i `validadores.ts` a `core/util`
- [x] Crear `LoginComponent` i `RegistroComponent` (Figura 3)
- [x] Redirigir segons el rol (o `returnUrl`) després d'iniciar sessió
- [x] Crear les proves dels formularis

## Com provar-ho
- Un login correcte porta a la pantalla d'inici del rol (o a `returnUrl`)
- Unes credencials errònies mostren «Credenciales incorrectas» sense tancar res
- Registrar-se amb un email repetit mostra l'error al camp `email`
- Les proves passen

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-10-login-registre`

---

## Pas F11 · Layouts de client i de taller

> **Requereix del backend:** Pas 10 (registre i login) per a veure l'usuari de la sessió.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Layouts de la zona del client (mòbil) i del taller (escriptori)` |
| **Branca** | `feature/fe-11-layouts` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F10.

## Guia
Pas F11 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-11-layouts
```

### Què es crea

- **layouts**: `ClienteLayoutComponent`, `TallerLayoutComponent`

### Execució (en ordre)

#### Prompt F11.1 · Layout del cliente

```text
Crea src/app/layouts/cliente-layout/cliente-layout.component.ts (ClienteLayoutComponent), siguiendo la maqueta de la Figura 6 de docs/propuesta-proyecto-motorlab.pdf (docs/maquetas/fig06-ordenes.png):
- Cabecera naranja con el título de la pantalla actual (input o dato de la ruta, p. ej. route.data.titulo) y a la derecha una campana con una insignia que muestra el número de avisos sin leer (signal noLeidas, de momento fijo a 0; se conectará en el paso de notificaciones).
- <router-outlet> en el centro, con scroll propio y el contenido con ancho máximo de 640 px centrado.
- Barra de pestañas fija abajo con enlaces routerLink y routerLinkActive a Vehículos (/cliente/vehiculos), Órdenes (/cliente/ordenes), Avisos (/cliente/avisos) y Perfil (/cliente/perfil); la activa en naranja y en negrita; cada enlace con un icono simple (SVG en línea) y su texto; altura táctil de 44 px mínimo.
- Respeta safe-area-inset-bottom en móviles.
Úsalo como componente de layout de la ruta '/cliente' en app.routes.ts (con los hijos actuales).
```

#### Prompt F11.2 · Layout del taller

```text
Crea src/app/layouts/taller-layout/taller-layout.component.ts (TallerLayoutComponent), siguiendo las maquetas de las Figuras 9 a 14 (docs/maquetas):
- Barra lateral oscura (--mo-noche) de 220 px con el logotipo «MotorLab» (cuadrado naranja con la M) y las opciones según el rol del usuario (computed): admin ve Solicitudes (/taller/solicitudes), Piezas (/taller/piezas), Panel (/taller/panel) y Usuarios (/taller/usuarios); mecanico ve Mis órdenes (/taller/mis-ordenes) y Piezas (/taller/piezas). La opción activa resaltada en naranja translúcido.
- Abajo de la barra: nombre del usuario, su rol y un botón «Cerrar sesión» que llama a AuthService.cerrarSesion().
- Área principal con <router-outlet> y relleno de 24 px.
- Responsive: en pantallas estrechas (< 900 px) la barra lateral se convierte en un menú desplegable con un botón de hamburguesa accesible (aria-expanded).
Úsalo como layout de la ruta '/taller' en app.routes.ts.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Entra com a **client** (`laura@cliente.example`): ha d'eixir la capçalera naranja i la barra inferior amb Vehículos, Órdenes, Avisos i Perfil. Entra com a **admin** (`admin@taller.example`): barra lateral amb Solicitudes, Piezas, Panel i Usuarios. Com a **mecànic** (`javi@taller.example`): només Mis órdenes i Piezas.

Comprova amb les eines de desenvolupador (`F12`, vista de mòbil) que la barra inferior no tapa el contingut.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): layouts de la zona del client i del taller"
git push -u origin feature/fe-11-layouts
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Layouts de client i de taller` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F11 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `ClienteLayoutComponent` (capçalera naranja, pestanyes inferiors, campaneta d'avisos)
- [x] Crear `TallerLayoutComponent` (barra lateral per rol, usuari i tancament de sessió)
- [x] Connectar els layouts a les rutes `/cliente` i `/taller`

## Com provar-ho
- La zona del client mostra la barra inferior (Vehículos, Órdenes, Avisos, Perfil) i es veu bé en mòbil
- La zona del taller mostra la barra lateral amb les opcions del rol (admin: 6; mecànic: 2)
- El botó de tancar sessió porta a `/login`

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-11-layouts`

---

## Pas F12 · Vehicles del client

> **Requereix del backend:** Pas 12 (validació de matrícula) i pas 13 (vehicles).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Vehicles del client: llistat, alta, edició i baixa` |
| **Branca** | `feature/fe-12-vehicles` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F11.

## Guia
Pas F12 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-12-vehicles
```

### Què es crea

- **core/util**: `matricula.ts`, `matricula.spec.ts`
- **core/services**: `VehiculosService`, `vehiculos.service.spec.ts`
- **features/vehiculos**: `VehiculosListaComponent`, `VehiculoFormComponent`

### Execució (en ordre)

#### Prompt F12.1 · Servicio y validador de matrícula

```text
1. Crea src/app/core/util/matricula.ts con normalizarMatricula(valor: string): string (trim, quita espacios y guiones y pasa a mayúsculas) y matriculaValidator (ValidatorFn) que acepte solo ^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$ tras normalizar (sección 5 de #file:docs/Motorlab_Api.md). Pruebas: «4821 KLB», «4821-klb» y «1234BCD» válidas; «4821 AEI», «123 ABC» y «4821KL» no válidas.
2. Crea src/app/core/services/vehiculos.service.ts (VehiculosService): listar(pagina, limite) -> Observable<Pagina<Vehiculo>>, obtener(id), crear(VehiculoRequest), actualizar(id, VehiculoRequest), darDeBaja(id) y historial(id, pagina, limite) -> Observable<Pagina<OrdenResumen>>, con las rutas de la sección «Vehículos» de #file:docs/Motorlab_Api.md. Añade vehiculos.service.spec.ts con HttpTestingController.
```

#### Prompt F12.2 · Pantallas de vehículos

```text
Crea en src/app/features/vehiculos, siguiendo la maqueta de la Figura 4 (docs/maquetas/fig04-vehiculos.png):
1. VehiculosListaComponent (ruta /cliente/vehiculos): tarjetas con «Marca Modelo · año», versión, matrícula y kilómetros (con separador de miles), y por cada vehículo los botones «Nueva solicitud» (navega a /cliente/solicitud/nueva?vehiculo=ID), «Historial» (/cliente/vehiculos/ID/historial) y «Editar». Botón «+ Añadir vehículo». Estados de carga y vacío, y paginador. Cada tarjeta tiene también «Dar de baja» con ModalConfirmacionComponent; si el servidor responde 409 (CONFLICTO), muestra su mensaje en un toast.
2. VehiculoFormComponent (rutas /cliente/vehiculos/nuevo y /cliente/vehiculos/:id/editar): campos matricula (con matriculaValidator; solo lectura al editar), marca, modelo, version (opcional), anio (entre 1980 y el año actual) y kilometros (entero >= 0). Al guardar llama a crear o actualizar; MATRICULA_DUPLICADA y los errores de validación se asignan al campo con aplicarErroresServidor; si va bien, toast de éxito y vuelta a la lista.
Sustituye las rutas Pendiente correspondientes.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Entra com a client i prova:
1. Crea un vehicle amb una matrícula nova.
2. Crea'n un altre amb la mateixa matrícula → error al camp.
3. Edita'l (la matrícula no es pot canviar).
4. Dona'l de baixa.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(vehiculos): llistat, alta, edició i baixa de vehicles"
git push -u origin feature/fe-12-vehicles
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Vehicles del client` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F12 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `matricula.ts` (normalització i validador) i `VehiculosService`
- [x] Crear `VehiculosListaComponent` i `VehiculoFormComponent`
- [x] Gestionar els errors 409 (`MATRICULA_DUPLICADA`, `CONFLICTO`)

## Com provar-ho
- Un client veu els seus vehicles, en crea un i el modifica (la matrícula no es pot canviar)
- Una matrícula repetida mostra l'error al camp `matricula`
- Donar de baixa un vehicle amb ordres obertes mostra el missatge del servidor
- Les proves passen

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-12-vehicles`

---

## Pas F13 · Servei d'ordres i nova sol·licitud

> **Requereix del backend:** Pas 13 (vehicles) i pas 15 (sol·licituds).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Servei d'ordres i formulari de nova sol·licitud de reparació` |
| **Branca** | `feature/fe-13-solicitud-nova` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F12.

## Guia
Pas F13 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-13-solicitud-nova
```

### Què es crea

- **core/services**: `OrdenesService`, `ordenes.service.spec.ts`
- **features/ordenes**: `SolicitudNuevaComponent`, `solicitud-nueva.component.spec.ts`

### Execució (en ordre)

#### Prompt F13.1 · OrdenesService

```text
Crea src/app/core/services/ordenes.service.ts (OrdenesService) según la sección «Órdenes» de #file:docs/Motorlab_Api.md, con estos métodos que devuelven Observables:
- crear(OrdenCreateRequest): POST /ordenes -> OrdenCreateResponse.
- listar(filtros: {estado?, urgencia?, mecanicoId?, q?, pagina?, limite?}) -> Pagina<OrdenResumen>; solo envía los parámetros que tengan valor.
- obtener(id) -> OrdenDetalle; seguimiento(id) -> Seguimiento; cancelar(id) -> OrdenDetalle.
(Los métodos de administración, asignar y cambiarEstado, se añadirán en el paso del taller.) Añade ordenes.service.spec.ts: listar omite los parámetros vacíos; crear hace el POST con el cuerpo correcto.
```

#### Prompt F13.2 · Formulario de nueva solicitud

```text
Crea src/app/features/ordenes/solicitud-nueva/solicitud-nueva.component.ts (SolicitudNuevaComponent, ruta /cliente/solicitud/nueva), siguiendo la maqueta de la Figura 5 (docs/maquetas/fig05-solicitud.png): formulario reactivo en 3 pasos con indicador «Paso X de 3» y barra de progreso:
1. Vehículo: selector con los vehículos del cliente (VehiculosService.listar, límite 100); si llega ?vehiculo=ID, lo preselecciona; si no tiene vehículos, VacioComponent con enlace a /cliente/vehiculos/nuevo.
2. Problema: tipoServicio (chips con ETIQUETAS_TIPO_SERVICIO), sintoma (textarea con contador «N caracteres · mínimo 20», entre 20 y 2000), cuandoOcurre (select opcional), conduccionSegura (segmentado Sí / No / No lo sé) y urgencia (segmentado Baja / Media / Alta). Muestra un aviso ámbar: «En frenos, o si no es seguro conducir, marcamos urgencia alta».
3. Cita: fechaPreferida (input date, mínimo hoy, con fechaHoyOPosteriorValidator), franjaPreferida (segmentado Mañana / Tarde), contactoPreferido (segmentado Teléfono / Correo) y la casilla aceptaPrivacidad (obligatoria).
Los botones Atrás/Siguiente validan solo los campos del paso actual. Un paso final muestra el resumen y «Enviar solicitud». Al enviar llama a OrdenesService.crear; al volver, muestra una pantalla de éxito con el mensaje del servidor, la urgencia resultante en una PillUrgenciaComponent y enlaces a la orden (/cliente/ordenes/ID) y a la lista. Los errores 400 se asignan a los campos con aplicarErroresServidor (si el campo está en otro paso, vuelve a ese paso). Usa signals para el paso actual. Sustituye la ruta Pendiente.
```

#### Prompt F13.3 · Pruebas de la solicitud

```text
Crea solicitud-nueva.component.spec.ts: no se puede avanzar del paso 2 con un síntoma de 10 caracteres; una fecha pasada es inválida en el paso 3; sin aceptaPrivacidad no se envía; con datos válidos se llama a OrdenesService.crear con el cuerpo esperado (vehiculoId, tipoServicio 'frenos', etc.).
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a client: `/cliente/solicitud/nueva`, tria un vehicle, servei **Frenos**, síntoma de 20+ caràcters, data d'avui, accepta la privacitat i envia. Ha d'eixir la urgència **alta**.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(ordenes): servei d'ordres i formulari de nova sol·licitud"
git push -u origin feature/fe-13-solicitud-nova
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Servei d'ordres i nova sol·licitud` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F13 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `OrdenesService` (crear, llistar, obtenir, seguiment, cancel·lar)
- [x] Crear `SolicitudNuevaComponent` amb 3 passos i resum
- [x] Mostrar la urgència resultant i l'avís informatiu de la regla de frenos

## Com provar-ho
- Una sol·licitud de **frenos** es crea i es mostra `urgencia: alta`
- Un síntoma de menys de 20 caràcters no deixa avançar
- Una data passada no és vàlida
- Les proves passen

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-13-solicitud-nova`

---

## Pas F14 · Les meues ordres i historial del vehicle

> **Requereix del backend:** Pas 15 (sol·licituds) i pas 16 (historial del vehicle).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Llistat d'ordres del client i historial del vehicle` |
| **Branca** | `feature/fe-14-ordres-client` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F13.

## Guia
Pas F14 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-14-ordres-client
```

### Què es crea

- **features/ordenes**: `OrdenesListaClienteComponent`
- **features/vehiculos**: `VehiculoHistorialComponent`

### Execució (en ordre)

#### Prompt F14.1 · Lista de órdenes del cliente

```text
Crea src/app/features/ordenes/ordenes-lista-cliente/ordenes-lista-cliente.component.ts (ruta /cliente/ordenes), siguiendo la maqueta de la Figura 6 (docs/maquetas/fig06-ordenes.png):
- Pestañas segmentadas «Activas» e «Historial». Pide OrdenesService.listar({limite: 100}) y reparte en el cliente: Historial = estados finales (esEstadoFinal) y Activas = el resto.
- Cada orden es una tarjeta: «#ID · Marca Modelo», matrícula y tipo de servicio, PillEstadoComponent, BarraProgresoComponent con el progreso y «Listo estimado» (con FechaHoraPipe 'completa') si hay fechaEstimada. Si presupuestoEstado es 'enviado', resalta la tarjeta con borde naranja, la pill «Presupuesto listo» y el total con EurosPipe, y un botón «Ver presupuesto» a /cliente/ordenes/ID/presupuesto. Pulsar el resto de la tarjeta navega a /cliente/ordenes/ID.
- Estados de carga y vacío (con enlace a «Nueva solicitud»). Un botón flotante o fijo «Nueva solicitud» a /cliente/solicitud/nueva.
Sustituye la ruta Pendiente.
```

#### Prompt F14.2 · Historial del vehículo

```text
Crea src/app/features/vehiculos/vehiculo-historial/vehiculo-historial.component.ts (ruta /cliente/vehiculos/:id/historial): muestra el título «Historial» con la matrícula, y la lista paginada de VehiculosService.historial(id, pagina, limite) con tarjetas parecidas a las de la lista de órdenes (sin pestañas), con PaginadorComponent. Si el servidor responde 404 (no es suyo), VacioComponent y botón para volver a /cliente/vehiculos. Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a client: `/cliente/ordenes` mostra la sol·licitud que has creat a «Activas». Obri l'historial d'un vehicle des de `/cliente/vehiculos`.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(ordenes): llistat d'ordres del client i historial del vehicle"
git push -u origin feature/fe-14-ordres-client
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Les meues ordres i historial` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F14 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `OrdenesListaClienteComponent` amb pestanyes Activas / Historial
- [x] Crear `VehiculoHistorialComponent`
- [x] Mostrar el pressupost pendent amb un botó «Ver presupuesto»

## Com provar-ho
- Les ordres s'agrupen en Activas i Historial segons el seu estat
- Una ordre amb pressupost enviat mostra «Presupuesto listo» i el seu total
- L'historial d'un vehicle mostra només les ordres d'eixe vehicle

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-14-ordres-client`

---

## Pas F15 · Detall i seguiment de l'ordre

> **Requereix del backend:** Pas 15 (sol·licituds), pas 21 (cancel·lar) i pas 22 (seguiment).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Detall i seguiment de l'ordre per al client (línia de temps)` |
| **Branca** | `feature/fe-15-detall-seguiment` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F14.

## Guia
Pas F15 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-15-detall-seguiment
```

### Què es crea

- **shared/components**: `LineaTiempoComponent`
- **features/ordenes**: `OrdenDetalleClienteComponent`

### Execució (en ordre)

#### Prompt F15.1 · Línea de tiempo

```text
Crea src/app/shared/components/linea-tiempo/linea-tiempo.component.ts (LineaTiempoComponent, selector app-linea-tiempo), siguiendo la maqueta de la Figura 8 (docs/maquetas/fig08-seguimiento.png): inputs eventos (EventoSeguimiento[]) y estado (EstadoOrden). Muestra una línea vertical con pasos. Los cinco pasos de ejecución son siempre visibles: Recibido, En preparación, Esperando pieza, Arreglando y Listo (con su descripción por defecto «Hemos recibido tu coche», «Diagnóstico y revisión», «Pastillas pedidas…» según la descripción del evento si la hay, «Cambio de pastillas y discos» y «Ya puedes recogerlo»). Un paso con evento aparece en naranja con un tic, la hora (FechaHoraPipe 'hora') y la descripción del evento; el paso actual lleva un halo; los pasos sin evento aparecen en gris. Antes del paso «Recibido» muestra, solo si existen, los eventos previos (solicitud recibida, presupuesto enviado, autorizado…) en una lista compacta. role="list" y que nada dependa solo del color.
```

#### Prompt F15.2 · Detalle y seguimiento del cliente

```text
Crea src/app/features/ordenes/orden-detalle-cliente/orden-detalle-cliente.component.ts (ruta /cliente/ordenes/:id):
- Carga OrdenesService.obtener(id) y OrdenesService.seguimiento(id) (forkJoin). Si el servidor responde 404, VacioComponent «Orden no encontrada».
- Tarjeta «Listo estimado» con la fecha (listoEstimado, 'completa'), el porcentaje (progreso) y BarraProgresoComponent, como en la Figura 8; debajo LineaTiempoComponent.
- Tarjetas con los datos: vehículo, tipo de servicio, síntoma, cuándo ocurre, urgencia (PillUrgenciaComponent) y mecánico/elevador si existen.
- Si hay presupuesto y su estado es 'enviado', un aviso naranja con el total y el botón «Ver presupuesto» a /cliente/ordenes/:id/presupuesto; si es 'autorizado', un enlace «Ver presupuesto autorizado».
- Botón «Cancelar orden» visible solo si el estado es solicitud_recibida, pendiente_presupuesto o presupuesto_enviado, con ModalConfirmacionComponent (peligro); al confirmar llama a OrdenesService.cancelar y recarga. Un 409 se muestra en un toast.
- Actualización automática cada 30 segundos con RxJS (timer + switchMap + takeUntilDestroyed) mientras el estado no sea final; se detiene al salir de la pantalla.
Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a client, obri la teua ordre. Per a veure l'ordre d'exemple **2481** entra com `laura@cliente.example` i ves a `/cliente/ordenes/2481`: ha de mostrar la línia de temps (Recibido 09:14, En preparación 10:02, Esperando pieza 11:30, Arreglando 13:05) i un 80 %.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(ordenes): detall i seguiment de l'ordre amb línia de temps"
git push -u origin feature/fe-15-detall-seguiment
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Detall i seguiment de l'ordre` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F15 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `LineaTiempoComponent` compartit
- [x] Crear `OrdenDetalleClienteComponent` amb dades, seguiment i cancel·lació
- [x] Actualitzar el seguiment automàticament cada 30 segons mentre l'ordre no estiga en un estat final

## Com provar-ho
- L'ordre d'exemple (2481) mostra la línia de temps amb 4 esdeveniments i un 80 %
- Els estats pendents apareixen en gris
- El client pot cancelar fins a `presupuesto_enviado`, amb confirmació
- L'actualització automàtica s'atura en eixir de la pantalla

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-15-detall-seguiment`

---

## Pas F16 · Pressupost del client

> **Requereix del backend:** Pas 19 (línies de pressupost) i pas 20 (enviar, autoritzar i rebutjar).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Pressupost del client: consultar, autoritzar i rebutjar` |
| **Branca** | `feature/fe-16-pressupost-client` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F15.

## Guia
Pas F16 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-16-pressupost-client
```

### Què es crea

- **core/services**: `PresupuestosService`, `presupuestos.service.spec.ts`
- **features/presupuestos**: `PresupuestoClienteComponent`

### Execució (en ordre)

#### Prompt F16.1 · PresupuestosService

```text
Crea src/app/core/services/presupuestos.service.ts (PresupuestosService) con todos los métodos de la sección «Presupuestos» de #file:docs/Motorlab_Api.md: obtenerPorOrden(ordenId), crear(ordenId), actualizar(id, PresupuestoUpdateRequest), anadirLinea(id, LineaRequest), modificarLinea(id, lineaId, LineaRequest), eliminarLinea(id, lineaId), enviar(id), autorizar(id) y rechazar(id, motivo?). Los tipos de respuesta son los de la referencia (Presupuesto, LineaCreada, Totales). Añade presupuestos.service.spec.ts con HttpTestingController: autorizar hace POST /presupuestos/1/autorizar; rechazar envía {motivo}.
```

#### Prompt F16.2 · Pantalla del presupuesto del cliente

```text
Crea src/app/features/presupuestos/presupuesto-cliente/presupuesto-cliente.component.ts (ruta /cliente/ordenes/:id/presupuesto), siguiendo la maqueta de la Figura 7 (docs/maquetas/fig07-presupuesto.png):
- Cabecera con «Presupuesto P-ID» y la orden; tarjeta con el vehículo; listado de líneas (concepto e importe con EurosPipe); subtotal, «IVA 21 %» (usa ivaPorcentaje) y total grande; pills «Listo en N h» (tiempoEstimadoHoras, si hay) y «Garantía N meses».
- Si el servidor responde 404 (todavía no hay presupuesto), VacioComponent «Todavía no hay presupuesto para esta orden».
- Si el estado es 'enviado': botones «Rechazar» (abre un modal con un campo motivo opcional, máx. 255) y «Autorizar» (modal de confirmación: «Al autorizar aceptas este presupuesto y el taller empezará la reparación»). Tras la acción, recarga y muestra el resultado: «Autorizado» en verde, o «Rechazado» con el motivo.
- Si el estado es 'autorizado' o 'rechazado', solo lectura con su estado.
- Los errores 409 (TRANSICION_NO_PERMITIDA) se muestran en un toast y se recarga el presupuesto.
Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Per a provar-ho, com a **admin** (pas següent del taller) cal enviar un pressupost. De moment, prova amb l'ordre d'exemple: `/cliente/ordenes/2481/presupuesto` mostra el pressupost **autoritzat** de 256,52 € en només lectura.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(presupuestos): pressupost del client amb autoritzar i rebutjar"
git push -u origin feature/fe-16-pressupost-client
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Pressupost del client` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F16 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `PresupuestosService` amb tots els mètodes de l'API
- [x] Crear `PresupuestoClienteComponent` amb Autorizar i Rechazar (amb motiu)
- [x] Gestionar l'estat «encara no hi ha pressupost» (404)

## Com provar-ho
- El client veu el desglossament, el subtotal, l'IVA, el total, el termini i la garantia
- Autoritzar canvia l'estat a «autorizado»; rebutjar demana un motiu opcional
- Un segon intent d'autoritzar mostra l'error 409 del servidor

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-16-pressupost-client`

---

## Pas F17 · Notificacions

> **Requereix del backend:** Pas 23 (notificacions).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Notificacions: contador, llistat i marcar com a llegides` |
| **Branca** | `feature/fe-17-notificacions` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F16.

## Guia
Pas F17 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-17-notificacions
```

### Què es crea

- **core/services**: `NotificacionesService`, `NotificacionesContadorService`
- **features/notificaciones**: `AvisosComponent`

### Execució (en ordre)

#### Prompt F17.1 · Servicio y contador

```text
1. Crea src/app/core/services/notificaciones.service.ts (NotificacionesService): listar({leida?, pagina?, limite?}) -> Pagina<Notificacion>, marcarLeida(id), marcarTodas() y contador() -> Observable<number> (la API devuelve un número entero, no un objeto), según la sección «Notificaciones» de #file:docs/Motorlab_Api.md.
2. Crea src/app/core/services/notificaciones-contador.service.ts (NotificacionesContadorService, providedIn root): signal noLeidas y métodos iniciar() y detener(). iniciar() consulta el contador cada 30 segundos con RxJS (timer(0, 30000) + switchMap + catchError que ignore los errores) y actualiza noLeidas; detener() cancela la consulta y pone noLeidas a 0; método refrescar() para forzar una consulta. Haz que se inicie cuando AuthService tenga sesión (effect sobre estaAutenticado) y se detenga al cerrar sesión. Pausa la consulta cuando la pestaña está oculta (document.visibilityState).
3. Conecta la insignia de la campana de ClienteLayoutComponent a noLeidas (si es 0, no se muestra). Añade pruebas: iniciar consulta de inmediato; detener pone el contador a 0.
```

#### Prompt F17.2 · Pantalla de avisos

```text
Crea src/app/features/notificaciones/avisos/avisos.component.ts (AvisosComponent, ruta /cliente/avisos): lista paginada de NotificacionesService.listar, de la más nueva a la más antigua, con filtro «Todas / Sin leer». Cada aviso muestra un icono según el tipo (TipoNotificacion), el mensaje, la fecha (FechaHoraPipe 'completa') y un punto naranja si no está leído. Al pulsar un aviso lo marca como leído (marcarLeida), refresca el contador y, si tiene ordenId, navega a /cliente/ordenes/ID (si el usuario es cliente) o a /taller/ordenes/ID (si es admin) o a /taller/mis-ordenes/ID (si es mecánico). Botón «Marcar todas como leídas» que llama a marcarTodas, vuelve a pedir el listado y refresca el contador sin depender del cuerpo de la respuesta. Estados de carga y vacío. Sustituye la ruta Pendiente de /cliente/avisos y añade en el layout del taller un enlace «Avisos» (/taller/avisos) que use el mismo componente, con su ruta en app.routes.ts para admin y mecánico.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Crea una sol·licitud com a client; entra com a admin: ha d'aparéixer un avís `solicitud_nueva` i el comptador puja (espera fins a 30 s o recarrega). Marca'l com a llegit i comprova que el comptador baixa.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(notificaciones): comptador, llistat i lectura d'avisos"
git push -u origin feature/fe-17-notificacions
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Notificacions` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F17 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `NotificacionesService`
- [x] Crear un comptador amb consulta periòdica i connectar-lo a la campaneta del layout
- [x] Crear `AvisosComponent` amb marcar com a llegida i marcar-les totes

## Com provar-ho
- El comptador de la campaneta coincideix amb `GET /notificaciones/contador`
- En marcar una notificació com a llegida, el comptador baixa
- En tancar la sessió, la consulta periòdica s'atura
- Una notificació amb `ordenId` porta a la seua ordre segons el rol

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-17-notificacions`

---

## Pas F18 · Perfil de l'usuari

> **Requereix del backend:** Pas 10 (`/auth/yo`).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Perfil de l'usuari i tancament de sessió` |
| **Branca** | `feature/fe-18-perfil` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F17.

## Guia
Pas F18 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-18-perfil
```

### Què es crea

- **features/perfil**: `PerfilComponent`

### Execució (en ordre)

#### Prompt F18.1 · PerfilComponent

```text
Crea src/app/features/perfil/perfil/perfil.component.ts (PerfilComponent, ruta /cliente/perfil): tarjeta con el nombre, el correo, el teléfono y el rol (ETIQUETAS_ROL) del usuario de AuthService.usuario(); un botón «Cerrar sesión» con ModalConfirmacionComponent que llama a AuthService.cerrarSesion(); y un texto con el enlace «Política de privacidad» (por ahora a '#'). Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a client: `/cliente/perfil` mostra les teues dades. Tanca la sessió i comprova que tornes a `/login` i que ja no pots entrar a `/cliente/ordenes`.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(perfil): pàgina de perfil amb tancament de sessió"
git push -u origin feature/fe-18-perfil
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Perfil de l'usuari` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F18 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `PerfilComponent` amb les dades de l'usuari i el botó de tancar sessió amb confirmació

## Com provar-ho
- `/cliente/perfil` mostra nom, correu, telèfon i rol
- Tancar la sessió esborra el token i porta a `/login`

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-18-perfil`

---

## Pas F19 · Taller: llistat de sol·licituds

> **Requereix del backend:** Pas 11 (usuaris) i pas 15 (llistat d'ordres).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Taller: serveis d'usuaris i llistat de sol·licituds amb filtres` |
| **Branca** | `feature/fe-19-taller-solicituds` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F18.

## Guia
Pas F19 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-19-taller-solicituds
```

### Què es crea

- **core/services**: `UsuariosService`, `usuarios.service.spec.ts`
- **features/taller/solicitudes**: `SolicitudesListaComponent`

### Execució (en ordre)

#### Prompt F19.1 · UsuariosService

```text
Crea src/app/core/services/usuarios.service.ts (UsuariosService) según la sección «Usuarios y panel» de #file:docs/Motorlab_Api.md: listar({rol?, pagina?, limite?}) -> Pagina<Usuario>, crear(UsuarioCreateRequest) -> Usuario y actualizar(id, UsuarioUpdateRequest) -> Usuario. Añade usuarios.service.spec.ts. Añade también el método listarMecanicos() que pida rol='mecanico' con límite 100 y filtre los activos.
```

#### Prompt F19.2 · Lista de solicitudes

```text
Crea src/app/features/taller/solicitudes/solicitudes-lista/solicitudes-lista.component.ts (ruta /taller/solicitudes, solo admin), siguiendo la maqueta de la Figura 9 (docs/maquetas/fig09-solicitudes.png):
- Título «Solicitudes» y una pill con el número de órdenes en solicitud_recibida.
- Filtros: buscador de texto (q, con debounce de 300 ms y distinctUntilChanged), select de estado (todos los EstadoOrden con su etiqueta), select de urgencia y select de mecánico (UsuariosService.listarMecanicos). Los filtros y la página se guardan en los queryParams de la URL y se restauran al abrir la pantalla.
- Tabla (clase .tabla) con las columnas Nº (#ordenId), Cliente, Vehículo («Marca Modelo · matrícula»), Servicio, Urgencia (PillUrgenciaComponent), Estado (PillEstadoComponent) y Entrada (fechaEntrada con FechaHoraPipe 'corta', o «—»). Las filas con urgencia 'alta' se resaltan suavemente. Cada fila es accesible por teclado (tabindex y Enter) y navega a /taller/ordenes/ID.
- PaginadorComponent con «Mostrando N de TOTAL órdenes», y estados de carga y vacío. Si la petición falla, un aviso rojo con botón «Reintentar».
Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Entra com `admin@taller.example`: `/taller/solicitudes` mostra la taula amb la 2481 i les noves. Prova els filtres (urgència «Alta»), la cerca per `4821` i recarrega: els filtres es mantenen.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): llistat de sol·licituds amb filtres i paginació"
git push -u origin feature/fe-19-taller-solicituds
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Taller: llistat de sol·licituds` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F19 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `UsuariosService`
- [x] Crear `SolicitudesListaComponent` amb taula, filtres, cerca amb debounce i paginació
- [x] Guardar els filtres a la URL (query params)

## Com provar-ho
- La taula mostra les ordres amb urgència i estat en pills
- Els filtres i la cerca per matrícula o nom funcionen i es mantenen en recarregar
- Fer clic en una fila porta a `/taller/ordenes/ID`
- Un mecànic no pot entrar en esta pantalla

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-19-taller-solicituds`

---

## Pas F20 · Taller: detall de l'ordre

> **Requereix del backend:** Pas 17 (assignació), pas 19 (pressupostos), pas 21 (canvi d'estat i cancel·lació) i pas 22 (seguiment).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Taller: detall de l'ordre, assignació, canvi d'estat i cancel·lació` |
| **Branca** | `feature/fe-20-taller-detall-ordre` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F19.

## Guia
Pas F20 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-20-taller-detall-ordre
```

### Què es crea

- **core/services**: `OrdenesService`, `(asignar,`, `cambiarEstado)`
- **shared/components**: `MatriculaComponent`
- **features/taller/orden-detalle**: `OrdenDetalleTallerComponent`

### Execució (en ordre)

#### Prompt F20.1 · Métodos de administración y placa

```text
1. En OrdenesService añade asignar(id, AsignacionRequest) (PATCH /ordenes/{id}/asignacion) y cambiarEstado(id, CambioEstadoRequest) (PATCH /ordenes/{id}/estado), ambos -> OrdenDetalle. Añade pruebas.
2. Crea src/app/shared/components/matricula/matricula.component.ts (MatriculaComponent, selector app-matricula): input matricula; la dibuja como una placa (borde negro, banda azul con una «E» y el texto grande con espacio entre el número y las letras: «4821 KLB»), como en la Figura 10.
```

#### Prompt F20.2 · Detalle de la orden para el administrador

```text
Crea src/app/features/taller/orden-detalle/orden-detalle-taller/orden-detalle-taller.component.ts (OrdenDetalleTallerComponent, ruta /taller/ordenes/:id, solo admin), siguiendo la maqueta de la Figura 10 (docs/maquetas/fig10-orden-taller.png):
- Cabecera «Orden de trabajo #ID» con PillEstadoComponent, y el subtítulo «Creada hoy HH:mm» a partir del primer evento de seguimiento.
- Rejilla de 4 tarjetas: Vehículo (marca, modelo, versión, año y kilómetros), Matrícula (MatriculaComponent), Síntoma (tipo de servicio, texto del cliente, cuándo ocurre y si se puede conducir) y Urgencia (PillUrgenciaComponent, tres barras rojas si es alta y el texto «Regla automática: frenos» cuando el tipo de servicio es frenos o conduccionSegura es 'no'). Datos de contacto del cliente (nombre, teléfono, forma de contacto preferida) y fecha y franja preferidas.
- Formulario de asignación: select de mecánico (UsuariosService.listarMecanicos), elevador (máx. 20) y fechaEstimada con un input datetime-local (al enviar, convierte «2026-10-12T18:30» en «2026-10-12T18:30:00»). «Guardar asignación» llama a OrdenesService.asignar; con toast de éxito y recarga.
- Acciones de estado: botones con las etiquetas de siguientesEstados(estado, 'admin') (por ejemplo «Marcar como pendiente de presupuesto», «Marcar como recibido», «Pasar a …», «Marcar como entregado»); cada uno llama a cambiarEstado con un campo opcional «Nota para el cliente» (máx. 200). Los errores 409 (TRANSICION_NO_PERMITIDA, STOCK_INSUFICIENTE) se muestran en un toast con el mensaje y los detalles.
- «Cancelar orden» con ModalConfirmacionComponent (peligro), visible si el estado permite cancelar (TRANSICIONES incluye 'cancelada'); llama a OrdenesService.cancelar.
- Presupuesto: si presupuesto es null y el estado es solicitud_recibida o pendiente_presupuesto, botón primario «Crear presupuesto» (PresupuestosService.crear y navegar a /taller/ordenes/ID/presupuesto); si ya existe, enlace «Ver presupuesto» (con su estado y total).
- Tarjeta con LineaTiempoComponent (OrdenesService.seguimiento).
Sustituye la ruta Pendiente de /taller/ordenes/:id y usa esta pantalla también cuando se llegue desde un aviso (enlaces de AvisosComponent).
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a **admin**: obri una sol·licitud nova, assigna Javi i «Elevador 2», guarda. Prova «Marcar como pendiente de presupuesto» i després «Crear presupuesto». Intenta una transició no permesa des d'una ordre en `listo`: només ha d'oferir «entregado».

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): detall de l'ordre amb assignació, estats i creació de pressupost"
git push -u origin feature/fe-20-taller-detall-ordre
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Taller: detall de l'ordre` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F20 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Afegir `asignar` i `cambiarEstado` a `OrdenesService`
- [x] Crear `MatriculaComponent` (placa) compartit
- [x] Crear `OrdenDetalleTallerComponent` amb targetes, assignació, accions d'estat i creació del pressupost

## Com provar-ho
- L'administrador assigna mecànic, elevador i data estimada i es guarda
- Els botons d'estat només mostren les transicions permeses (`siguientesEstados`)
- «Crear presupuesto» crea el pressupost en esborrany i porta a l'editor
- Cancel·lar una ordre demana confirmació

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-20-taller-detall-ordre`

---

## Pas F21 · Taller: editor de pressupost

> **Requereix del backend:** Pas 18 (peces), pas 19 (línies del pressupost) i pas 20 (enviar).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Taller: editor de pressupost amb línies, peces i totals` |
| **Branca** | `feature/fe-21-taller-editor-pressupost` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F20.

## Guia
Pas F21 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-21-taller-editor-pressupost
```

### Què es crea

- **core/services**: `PiezasService`, `piezas.service.spec.ts`
- **features/taller/presupuesto-editor**: `LineaDialogComponent`, `PresupuestoEditorComponent`

### Execució (en ordre)

#### Prompt F21.1 · PiezasService (consulta)

```text
Crea src/app/core/services/piezas.service.ts (PiezasService) con listar({q?, soloActivas?, stockBajo?, pagina?, limite?}) -> Pagina<Pieza> según la sección «Piezas» de #file:docs/Motorlab_Api.md; solo envía los parámetros con valor. (Los métodos de escritura se añadirán en el paso del catálogo.) Añade piezas.service.spec.ts.
```

#### Prompt F21.2 · Diálogo de línea

```text
Crea src/app/features/taller/presupuesto-editor/linea-dialog/linea-dialog.component.ts (LineaDialogComponent) con <dialog> nativo y formulario reactivo; inputs abierto y linea (para editar, opcional); outputs guardar (LineaRequest) y cancelar:
- Selector de tipo (segmentado «Pieza» / «Mano de obra»).
- Pieza: buscador con debounce de 300 ms que usa PiezasService.listar({q, soloActivas: true, limite: 10}) y muestra los resultados («referencia · nombre · precio · stock»); al elegir una se guarda piezaId y se enseña su precio (solo lectura: el servidor lo copia del catálogo); cantidad entera > 0; si el stock de la pieza es menor que la cantidad, aviso ámbar «Stock N, necesarias M» (informativo).
- Mano de obra: concepto (obligatorio, máx. 150), cantidad (horas, > 0, admite decimales) y precioUnitario (tarifa por hora, >= 0).
- Los errores 400/409 del servidor se asignan a los campos con aplicarErroresServidor.
```

#### Prompt F21.3 · Editor de presupuesto

```text
Crea src/app/features/taller/presupuesto-editor/presupuesto-editor/presupuesto-editor.component.ts (PresupuestoEditorComponent, ruta /taller/ordenes/:id/presupuesto, solo admin), siguiendo la maqueta de la Figura 11 (docs/maquetas/fig11-presupuesto-editor.png):
- Carga PresupuestosService.obtenerPorOrden(id). Si responde 404, muestra «Esta orden todavía no tiene presupuesto» y un botón «Crear presupuesto». Cabecera «Presupuesto P-ID», subtítulo «Marca Modelo · matrícula · cliente» y la pill del estado (EstadoPresupuesto).
- Tabla de líneas: concepto (con una pill ámbar «Stock N de M» si hay aviso para esa pieza en avisosStock), referencia, cantidad (horas con «h» en mano de obra), precio, importe (EurosPipe) y botones de editar y eliminar. Botones «+ Añadir pieza del catálogo» y «+ Añadir mano de obra» que abren LineaDialogComponent. Solo se puede editar mientras el estado es 'borrador'; en cualquier otro estado, solo lectura.
- Tras añadir, modificar o eliminar una línea, vuelve a pedir el presupuesto completo (obtenerPorOrden) para mostrar los totales que calcula el servidor.
- Resumen: subtotal, «IVA N %», total grande (EurosPipe), pills «Stock: X de Y piezas» (según avisosStock) y un formulario pequeño con tiempoEstimadoHoras y garantiaMeses (PresupuestosService.actualizar al salir del campo o con un botón «Guardar»).
- Botón primario «Enviar presupuesto al cliente» (deshabilitado si no hay líneas) con ModalConfirmacionComponent; al confirmar llama a PresupuestosService.enviar, toast de éxito y vuelve a /taller/ordenes/ID. Si el servidor responde 400 («El presupuesto no tiene líneas») o 409, muestra su mensaje.
Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a **admin**, en una ordre nova (frenos): «Crear presupuesto» i afig les línies de la demostració (Pastillas BR-2231 ×1, Discos DS-118 ×2, Líquido LF-040 ×1 i 1,5 h de mà d'obra a 28 €/h): han d'eixir **212,00 / 44,52 / 256,52** i l'avís d'stock de DS-118. Envia'l i entra com a client: ha d'aparéixer «Presupuesto listo».

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): editor de pressupost amb línies, totals i enviament"
git push -u origin feature/fe-21-taller-editor-pressupost
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Taller: editor de pressupost` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F21 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `PiezasService` (llistat per a la cerca)
- [x] Crear `LineaDialogComponent` (pieza o mano de obra)
- [x] Crear `PresupuestoEditorComponent` amb línies, totals, termini, garantia, avisos d'stock i enviament

## Com provar-ho
- Afegir les 4 línies de la demostració dona **212,00 / 44,52 / 256,52** (valors del servidor)
- Una peça sense stock suficient mostra l'avís «Stock 1 de 2» sense impedir guardar
- Un pressupost ja enviat es mostra en només lectura
- «Enviar presupuesto» demana confirmació i canvia l'estat a «enviado»

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-21-taller-editor-pressupost`

---

## Pas F22 · Taller: catàleg de peces

> **Requereix del backend:** Pas 18 (peces i stock).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Taller: catàleg de peces i gestió d'stock` |
| **Branca** | `feature/fe-22-taller-peces` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F21.

## Guia
Pas F22 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-22-taller-peces
```

### Què es crea

- **core/services**: `PiezasService`, `(escritura)`
- **features/taller/piezas**: `PiezasListaComponent`, `PiezaDialogComponent`, `StockDialogComponent`

### Execució (en ordre)

#### Prompt F22.1 · Escritura en PiezasService

```text
Amplía PiezasService con crear(PiezaRequest), obtener(id), actualizar(id, PiezaRequest), darDeBaja(id) y ajustarStock(id, StockDeltaRequest) según la sección «Piezas» de #file:docs/Motorlab_Api.md. Añade pruebas: ajustarStock envía PATCH /piezas/1/stock con {delta, motivo}.
```

#### Prompt F22.2 · Catálogo de piezas

```text
Crea src/app/features/taller/piezas/piezas-lista/piezas-lista.component.ts (PiezasListaComponent, ruta /taller/piezas para admin y mecánico), siguiendo la maqueta de la Figura 13 (docs/maquetas/fig13-piezas.png):
- Título «Catálogo de piezas», buscador (debounce 300 ms), casilla «Solo con stock bajo» (stockBajo) y «Solo activas» (por defecto marcada); tabla con Referencia, Pieza, Precio (EurosPipe), Stock (en rojo y negrita si stockBajo), Estado (pill «Correcto» o «Stock bajo», «Inactiva» si activa es false) y acciones; paginador.
- Solo para el rol admin: botón «+ Nueva pieza», acciones «Editar», «Dar de baja» (confirmación) y «Registrar entrada» (destacado en naranja si el stock es bajo). El mecánico solo ve la tabla.
- PiezaDialogComponent (crear/editar): referencia (obligatoria, máx. 30), nombre (máx. 120), precio (>= 0) y stock inicial (solo al crear, >= 0). Errores del servidor (por ejemplo, referencia repetida con 409 CONFLICTO) en el campo o en un toast.
- StockDialogComponent: delta (entero distinto de 0; positivo para entradas) y motivo (máx. 200, opcional). Un 409 STOCK_INSUFICIENTE se muestra en el propio diálogo.
Tras cada cambio, recarga la página actual. Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a admin: `/taller/piezas`. Registra una entrada de **+4** a DS-118 i comprova el stock. Intenta un ajust de **-100** → error 409. Entra com a mecànic (`javi@taller.example`): veu la taula sense accions.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): catàleg de peces i ajust d'stock"
git push -u origin feature/fe-22-taller-peces
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Taller: catàleg de peces` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F22 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Ampliar `PiezasService` (crear, actualitzar, baixa, ajust d'stock)
- [x] Crear `PiezasListaComponent` amb cerca, filtres i paginació
- [x] Crear els diàlegs de peça i d'ajust d'stock (només administrador)

## Com provar-ho
- Es veuen les peces amb preu, stock i estat (stock baix en roig)
- L'administrador crea, edita i dona de baixa peces; el mecànic només les veu
- Registrar una entrada de stock +4 de DS-118 actualitza la fila
- Un ajust que deixaria l'stock negatiu mostra l'error 409

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-22-taller-peces`

---

## Pas F23 · Mecànic: les meues ordres i canvi d'estat

> **Requereix del backend:** Pas 21 (canvi d'estat) i pas 19–20 (pressupost, que el mecànic pot consultar).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Mecànic: les meues ordres i canvi d'estat de la reparació` |
| **Branca** | `feature/fe-23-taller-mecanic` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F22.

## Guia
Pas F23 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-23-taller-mecanic
```

### Què es crea

- **features/taller/mecanico**: `MisOrdenesMecanicoComponent`, `OrdenMecanicoComponent`

### Execució (en ordre)

#### Prompt F23.1 · Lista de órdenes del mecánico

```text
Crea src/app/features/taller/mecanico/mis-ordenes-mecanico/mis-ordenes-mecanico.component.ts (ruta /taller/mis-ordenes, solo mecanico), siguiendo la maqueta de la Figura 12 (docs/maquetas/fig12-mecanico.png): título «Mis órdenes» con el nombre del mecánico y el número de órdenes activas; tarjetas con «#ID · Marca Modelo», matrícula, servicio, elevador, PillUrgenciaComponent, PillEstadoComponent y BarraProgresoComponent. Usa OrdenesService.listar (el servidor ya devuelve solo las asignadas) y muestra primero las activas y luego, plegadas, las finalizadas. Pulsar una tarjeta navega a /taller/mis-ordenes/ID. Estados de carga y vacío.
```

#### Prompt F23.2 · Cambio de estado del mecánico

```text
Crea src/app/features/taller/mecanico/orden-mecanico/orden-mecanico.component.ts (OrdenMecanicoComponent, ruta /taller/mis-ordenes/:id, solo mecanico), siguiendo la maqueta de la Figura 12:
- Cabecera «Orden #ID» y datos (vehículo, matrícula con MatriculaComponent, síntoma y urgencia).
- «Cambiar estado»: una fila de botones con las opciones de siguientesEstados(estado, 'mecanico'); la opción actual resaltada y las no permitidas deshabilitadas. Campo «Nota visible para el cliente» (máx. 200). «Guardar cambio» llama a OrdenesService.cambiarEstado y recarga.
- «Piezas del presupuesto»: carga PresupuestosService.obtenerPorOrden(id) y muestra cada línea de tipo pieza con su cantidad y una pill de stock (verde «Stock N» o roja «Stock N · faltan M» usando avisosStock). Si el presupuesto no existe (404), omite la sección. Si faltan piezas y el siguiente estado es 'arreglando', aviso ámbar «Para pasar a Arreglando debe haber stock de todas las piezas. Pide a recepción que registre la entrada».
- Los errores 409 STOCK_INSUFICIENTE se muestran con el detalle de cada pieza (mensaje «Stock 1, necesarias 2») y TRANSICION_NO_PERMITIDA con su mensaje, sin cambiar el estado en pantalla. Un 403 (orden no asignada) lleva a /403.
- LineaTiempoComponent con el seguimiento.
Sustituye las rutas Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a admin, assigna una ordre a Javi i porta-la a `recibido`. Entra com `javi@taller.example`: `/taller/mis-ordenes` mostra la ordre. Passa a `en_preparacion` i a `esperando_pieza`; després intenta `arreglando` sense stock → missatge d'stock insuficient. Registra l'entrada de la peça (admin) i torna-ho a provar.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): vista del mecànic amb canvi d'estat i avís d'stock"
git push -u origin feature/fe-23-taller-mecanic
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Mecànic: ordres i canvi d'estat` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F23 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `MisOrdenesMecanicoComponent` amb targetes i progrés
- [x] Crear `OrdenMecanicoComponent` amb botons d'estat, nota per al client i peces del pressupost
- [x] Gestionar els errors 409 `STOCK_INSUFICIENTE` i `TRANSICION_NO_PERMITIDA`

## Com provar-ho
- El mecànic només veu les ordres assignades a ell
- Només pot triar els estats `en_preparacion`, `esperando_pieza`, `arreglando` i `listo`
- Passar a «arreglando» sense stock mostra «Stock 1, necesarias 2» i l'estat no canvia
- Un administrador no pot entrar a esta pantalla

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-23-taller-mecanic`

---

## Pas F24 · Taller: gestió d'usuaris

> **Requereix del backend:** Pas 11 (gestió d'usuaris).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Taller: gestió d'usuaris (administrador)` |
| **Branca** | `feature/fe-24-taller-usuaris` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F23.

## Guia
Pas F24 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-24-taller-usuaris
```

### Què es crea

- **features/taller/usuarios**: `UsuariosListaComponent`, `UsuarioDialogComponent`

### Execució (en ordre)

#### Prompt F24.1 · Gestión de usuarios

```text
Crea en src/app/features/taller/usuarios (ruta /taller/usuarios, solo admin):
1. UsuariosListaComponent: tabla (clase .tabla) con Nombre, Correo, Teléfono, Rol (pill) y Estado (activo/inactivo) con un interruptor accesible para activar/desactivar (UsuariosService.actualizar con {activo}); el interruptor del propio usuario está deshabilitado con una explicación (el servidor también lo impide). Filtro por rol (todos, cliente, mecánico, administrador) y paginador. Un 400 o un 409 del servidor se muestra en un toast.
2. UsuarioDialogComponent (botón «+ Nuevo usuario»): nombre, correo, teléfono, contraseña (8 a 72 caracteres) y rol (select), con las mismas validaciones que el registro (sección 5 de #file:docs/Motorlab_Api.md); EMAIL_DUPLICADO y errores de validación se asignan a los campos con aplicarErroresServidor.
Sustituye la ruta Pendiente.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a admin: crea un mecànic nou i filtra per rol «Mecánico». Desactiva'l i activa'l. Comprova que el teu propi interruptor està deshabilitat.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): gestió d'usuaris per a l'administrador"
git push -u origin feature/fe-24-taller-usuaris
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Taller: gestió d'usuaris` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F24 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `UsuariosListaComponent` amb filtre per rol i paginació
- [x] Crear `UsuarioDialogComponent` per a crear usuaris
- [x] Activar i desactivar usuaris, bloquejant el propi

## Com provar-ho
- L'administrador veu la llista i filtra per rol
- Pot crear un mecànic nou amb contrasenya
- Pot activar i desactivar usuaris, però no el seu propi
- Un mecànic no pot entrar a `/taller/usuarios`

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-24-taller-usuaris`

---

## Pas F25 · Taller: panell de mètriques

> **Requereix del backend:** Pas 24 (panell de mètriques).

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Taller: panell de mètriques` |
| **Branca** | `feature/fe-25-taller-panell` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F24.

## Guia
Pas F25 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-25-taller-panell
```

### Què es crea

- **core/services**: `PanelService`, `panel.service.spec.ts`
- **features/taller/panel**: `PanelComponent`

### Execució (en ordre)

#### Prompt F25.1 · Panel de métricas

```text
Crea src/app/core/services/panel.service.ts (PanelService con metricas() -> Observable<Metricas>) y src/app/features/taller/panel/panel/panel.component.ts (PanelComponent, ruta /taller/panel, solo admin), siguiendo la maqueta de la Figura 14 (docs/maquetas/fig14-panel.png):
- Cuatro tarjetas de indicadores: Órdenes activas, Presupuestos sin respuesta (en naranja), Ingresos del mes (EurosPipe) y Piezas con stock bajo (en rojo, con enlace a /taller/piezas?stockBajo=true, y haz que PiezasListaComponent lea ese queryParam).
- «Órdenes por estado»: una barra horizontal por cada estado de ordenesPorEstado (etiqueta con ETIQUETAS_ESTADO, barra proporcional al máximo, recuento a la derecha), hecha solo con CSS; los estados que no vengan en la respuesta se omiten.
- Estados de carga, vacío y error con «Reintentar». Sustituye la ruta Pendiente. Añade panel.service.spec.ts.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Com a admin: `/taller/panel`. Compara les xifres amb `GET /api/v1/panel/metricas` des de Swagger.

### Commit, push i pull request

```bash
git add .
git commit -m "feat(taller): panell de mètriques amb indicadors i barres per estat"
git push -u origin feature/fe-25-taller-panell
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Taller: panell de mètriques` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F25 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `PanelService` i `PanelComponent`
- [x] Mostrar 4 indicadors i un gràfic de barres per estat amb CSS (sense llibreries)

## Com provar-ho
- Els 4 indicadors coincideixen amb la resposta de `GET /panel/metricas`
- Les barres per estat són proporcionals
- Els ingressos del mes es mostren en euros

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-25-taller-panell`

---

## Pas F26 · Pàgines d'error i gestió global

> **Requereix del backend:** Cap.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Pàgines d'error (403, 404), gestor global d'errors i neteja de la pàgina de mostra` |
| **Branca** | `feature/fe-26-errors-globals` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F25.

## Guia
Pas F26 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-26-errors-globals
```

### Què es crea

- **shared/components**: `Error403Component`, `Error404Component`
- **core/services**: `GestorErrores`

### Execució (en ordre)

#### Prompt F26.1 · Páginas de error y gestor global

```text
1. Crea src/app/shared/components/error-403/error-403.component.ts y error-404.component.ts, con un título, un texto amable y un botón «Ir al inicio» que navega a pantallaInicio(rol) (o a /login si no hay sesión). Sustituye las rutas '/403' y '/404' de app.routes.ts.
2. Crea src/app/core/services/gestor-errores.ts (GestorErrores implements ErrorHandler): registra el error en console.error y muestra un toast «Ha ocurrido un error inesperado» (sin duplicar los toasts de los ApiError ya gestionados). Regístralo en app.config.ts con provide ErrorHandler.
3. Elimina la ruta '/estilos' y la carpeta src/app/features/estilos (o, si prefieres conservarla, deja la ruta solo si !environment.production).
4. Revisa todo el proyecto y dime si algún componente usa HttpClient directamente (debería usarse solo en los servicios de core/services) y corrígelo.
```

### Comprovació

Arranca el backend (perfil `local`) i el frontend, cadascun en un terminal de Git Bash:

```bash
# Terminal 1 · backend (carpeta del repositori del backend)
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run

# Terminal 2 · frontend (carpeta del repositori del frontend)
npm start
```

Obri `http://localhost:4200`.

Prova `/ruta-que-no-existe` (404) i, com a client, `/taller/solicitudes` (403).

### Commit, push i pull request

```bash
git add .
git commit -m "feat(frontend): pàgines 403 i 404, gestor global d'errors i neteja"
git push -u origin feature/fe-26-errors-globals
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Pàgines d'error i gestor global` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F26 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear les pàgines `/403` i `/404`
- [x] Crear un `ErrorHandler` global que registre l'error i mostre un toast
- [x] Eliminar la ruta i la pàgina `/estilos` (o limitar-la a desenvolupament)
- [x] Revisar que cap component use `HttpClient` directament

## Com provar-ho
- Una URL inexistent mostra la pàgina 404 amb un botó per a tornar a l'inici
- Un client que entra a `/taller/...` veu la pàgina 403
- Un error no controlat mostra un toast en lloc de deixar la pantalla en blanc
- `git grep HttpClient` només apareix als serveis i a la configuració

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-26-errors-globals`

---

## Pas F27 · Proves manuals de la demostració

> **Requereix del backend:** Tots els passos del backend fins al 25.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Proves manuals de la demostració completa amb els tres rols` |
| **Branca** | `feature/fe-27-proves-manuals` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F26.

## Guia
Pas F27 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-27-proves-manuals
```

### Què es crea

- **docs**: `pruebas_manuales_frontend.md`

### Execució (en ordre)

#### Prompt F27.1 · Documento de pruebas manuales

```text
Genera docs/pruebas_manuales_frontend.md en castellano con una tabla de casos de prueba (columnas: nº, rol, pasos, resultado esperado, resultado obtenido [vacío] y estado [ ]) que cubra, como mínimo:
1. Registro de un cliente nuevo, email repetido, contraseña corta y login con credenciales erróneas.
2. Alta de vehículo, matrícula repetida, edición y baja.
3. Solicitud de frenos (urgencia alta), validaciones del formulario (síntoma corto, fecha pasada) y cancelación.
4. Administrador: filtros de solicitudes, asignación de mecánico, crear presupuesto con las 4 líneas de la demostración (212,00 / 44,52 / 256,52), aviso de stock de DS-118 y envío.
5. Cliente: aviso «Presupuesto listo», ver el presupuesto, rechazarlo con motivo en una orden y autorizarlo en otra.
6. Administrador: pasar a recibido; mecánico: en preparación, esperando pieza, intento de arreglando sin stock (error), entrada de stock de +4 de DS-118 por el administrador, arreglando y listo; administrador: entregado.
7. Cliente: el seguimiento muestra los 5 pasos con sus horas y el progreso 100.
8. Permisos: un cliente no ve las órdenes de otro (404), un cliente en /taller (403), un mecánico en /taller/usuarios (403).
9. Sesión: recargar la página mantiene la sesión; cerrar sesión impide volver con el botón Atrás; el token caducado lleva a /login.
10. Interfaz: pantalla de 360 px de ancho en la zona del cliente y de 1280 px en la del taller.
```

### Comprovació

Executa els casos amb el backend (perfil `local`) i el frontend arrancats, i marca cada fila del document. Si trobes un error, crea una issue o corregeix-lo en esta mateixa PR.

### Commit, push i pull request

```bash
git add .
git commit -m "test(frontend): casos de prova manuals de la demostració completa"
git push -u origin feature/fe-27-proves-manuals
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Proves manuals de la demostració` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F27 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear `docs/pruebas_manuales_frontend.md` amb els casos de prova
- [x] Executar-los i anotar els resultats
- [x] Corregir els errors que apareguen

## Com provar-ho
- Tots els casos de `docs/pruebas_manuales_frontend.md` estan marcats com a correctes
- La demostració completa funciona des del navegador amb els tres rols

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-27-proves-manuals`

---

## Pas F28 · Accessibilitat i responsive

> **Requereix del backend:** Cap.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] Revisió d'accessibilitat i responsive` |
| **Branca** | `feature/fe-28-accessibilitat` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F27.

## Guia
Pas F28 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-28-accessibilitat
```

### Execució (en ordre)

#### Prompt F28.1 · Auditoría de accesibilidad

```text
Audita el frontend y dame una lista de problemas por archivo, ordenada por gravedad, revisando: (1) todos los campos tienen <label> asociado y los errores usan role="alert"; (2) los botones con solo icono tienen aria-label; (3) el foco es visible y el orden de tabulación es lógico, incluidos los diálogos (el foco entra y vuelve); (4) los estados nunca se indican solo con color; (5) el contraste de los textos sobre naranja, gris y ámbar cumple WCAG AA; (6) las tablas tienen <th scope> y la fila clicable es accesible con teclado; (7) las imágenes y SVG decorativos llevan aria-hidden; (8) el idioma del documento es "es" en index.html; (9) nada se desborda horizontalmente a 360 px. No cambies nada todavía.
```

#### Prompt F28.2 · Correcciones

```text
Aplica las correcciones de la auditoría anterior, empezando por las más graves, sin cambiar el comportamiento de la aplicación. Tras cada grupo de cambios, dime qué has modificado y cómo comprobarlo.
```

### Comprovació

Obri Chrome → `F12` → pestanya *Lighthouse* → categoria *Accessibility* i executa-ho al login, a `/cliente/ordenes` i a `/taller/solicitudes`. Prova a completar el login amb només el teclat (`Tab`, `Enter`, `Espai`).

### Commit, push i pull request

```bash
git add .
git commit -m "fix(frontend): accessibilitat i responsive"
git push -u origin feature/fe-28-accessibilitat
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Accessibilitat i responsive` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F28 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Revisar etiquetes, focus, contrast, rols ARIA i ordre de tabulació
- [x] Passar Lighthouse (accessibilitat) a les pantalles principals
- [x] Corregir els problemes trobats

## Com provar-ho
- Lighthouse d'accessibilitat ≥ 90 al login, a les ordres del client i a les sol·licituds del taller
- Es pot completar el login i una sol·licitud només amb teclat
- No hi ha scroll horitzontal a 360 px d'ample

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-28-accessibilitat`

---

## Pas F29 · (Opcional) Servir el frontend des de Spring Boot

> **Requereix del backend:** Pas 9 (`SecurityConfig`) i el backend complet.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Fullstack] (Opcional) Servir el frontend compilat des de Spring Boot` |
| **Branca** | `feature/fe-29-servir-des-de-spring` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F28.

## Guia
Pas F29 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-29-servir-des-de-spring
```

### Què es crea

- **scripts**: `build-frontend.sh`
- **controller**: `SpaForwardController`

### Execució (en ordre)

> Este pas toca **els dos repositoris**: l'script va al del frontend i el controlador i la seguretat al del backend (fes-hi una branca i una PR pròpies, i crea la issue al repositori on faces cada canvi).

#### Script de compilació (a mà)

Crea `scripts/build-frontend.sh` al repositori del frontend. Rep com a argument la ruta del repositori del backend:

```bash
#!/usr/bin/env bash
set -e
BACKEND="${1:?Ús: bash scripts/build-frontend.sh ../ruta-del-backend}"
npm ci
npm run build:prod
rm -rf "$BACKEND/src/main/resources/static"
mkdir -p "$BACKEND/src/main/resources/static"
cp -r dist/motorlab/browser/* "$BACKEND/src/main/resources/static/"
echo "Frontend copiat a $BACKEND/src/main/resources/static"
```

La ruta `dist/motorlab/browser` depén del nom del projecte d'`angular.json` (`motorlab`); comprova-la després de `npm run build:prod`. Afig `src/main/resources/static/` al `.gitignore` **del backend**.

#### Prompt F29.1 · Reenvío de rutas y seguridad (backend)

```text
Estoy en la raíz del repositorio del backend (proyecto Spring Boot). El frontend Angular compilado se copiará a src/main/resources/static. Haz estos cambios en el backend:
1. Crea el controlador com.motorlab.controller.SpaForwardController (@Controller) que reenvíe a "forward:/index.html" las rutas de la aplicación Angular que no sean de la API ni archivos estáticos: "/cliente/**", "/taller/**", "/login", "/registro", "/403" y "/404".
2. En config.SecurityConfig, permite sin autenticación (permitAll) las peticiones GET a "/", "/index.html", "/*.js", "/*.css", "/*.ico", "/assets/**", "/media/**" y a esas rutas de la aplicación, manteniendo la regla actual de que todo lo que empiece por /api/** requiere autenticación (salvo /api/v1/auth/registro y /api/v1/auth/login).
3. No cambies nada más y explícame cómo comprobar que /api/v1/... sigue devolviendo 401 sin token.
```

### Comprovació

```bash
bash scripts/build-frontend.sh ../motorlab-backend     # des del repositori del frontend
cd ../motorlab-backend
export DB_USER=motorlab_usr DB_PASS=motorlab_usr SPRING_PROFILES_ACTIVE=local
export JWT_SECRET="$(openssl rand -base64 48)"
./mvnw spring-boot:run
```
Obri `http://localhost:8080/`, entra amb un usuari i recarrega `/cliente/ordenes`. Comprova amb `curl -i http://localhost:8080/api/v1/vehiculos` (ha de ser 401).

### Commit, push i pull request

```bash
git add .
git commit -m "feat(fullstack): servir el frontend compilat des de Spring Boot"
git push -u origin feature/fe-29-servir-des-de-spring
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `Servir el frontend des de Spring Boot` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F29 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Crear l'script `scripts/build-frontend.sh` (al repositori del frontend) que compila Angular i copia el resultat a `src/main/resources/static/` del repositori del backend
- [x] Al repositori del backend: afegir un controlador que reenvie les rutes de l'aplicació a `index.html`
- [x] Ajustar `SecurityConfig` perquè els recursos estàtics siguen públics i l'API continue protegida
- [x] Ignorar `src/main/resources/static/` al `.gitignore` del backend

## Com provar-ho
- `http://localhost:8080/` mostra l'aplicació Angular
- Recarregar `/cliente/ordenes` no dona 404
- `/api/v1/...` continua protegida (401 sense token)
- `src/main/resources/static/` no es puja a Git

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-29-servir-des-de-spring`

---

## Pas F30 · README i documentació del frontend

> **Requereix del backend:** Cap.

### GitHub: issue i branca

| Camp | Valor |
|---|---|
| **Títol de la issue** | `[Frontend] README del frontend i documentació d'execució conjunta` |
| **Branca** | `feature/fe-30-readme-frontend` |

**Descripció de la issue** (copia-la al camp *Description*):

```markdown
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
la issue del pas F29.

## Guia
Pas F30 de `docs/guia_github_frontend_motorlab.md`.
```

```bash
git checkout main
git pull
git checkout -b feature/fe-30-readme-frontend
```

### Què es crea

- **arrel**: `README.md`

### Execució (en ordre)

#### Prompt F30.1 · README del frontend

```text
1. Sustituye el README.md de la raíz de este repositorio (el que genera Angular) por uno de MotorLab en castellano con: requisitos (Node LTS y Angular CLI), instalación (npm ci), scripts (npm start, npm test, npm run build y build:prod), el proxy hacia el backend, los entornos, la estructura de carpetas de src/app (core, shared, layouts, features) y las convenciones del proyecto (componentes standalone, signals, interfaces en camelCase igual que el JSON, un servicio por dominio).
2. Añade en ese mismo README una sección «Cómo arrancar todo» (backend y frontend, que están en repositorios distintos, con el enlace al del backend) que explique, para Git Bash en Windows: crear las bases de datos de PostgreSQL, arrancar el backend (con las variables de entorno y el perfil local), arrancar el frontend, las credenciales de desarrollo y las URLs (frontend http://localhost:4200, backend http://localhost:8080, Swagger http://localhost:8080/swagger-ui.html).
```

### Comprovació

Segueix el README en una carpeta nova i comprova que backend i frontend arrancen.

### Commit, push i pull request

```bash
git add .
git commit -m "docs(frontend): README del frontend i execució conjunta"
git push -u origin feature/fe-30-readme-frontend
```

| Camp | Valor |
|---|---|
| **Títol de la PR** | `README del frontend` |
| **Branca base** | `main` |

**Descripció de la PR** (substitueix `N` pel número de la issue d'este pas: `grep '^F30 ' issues_frontend.txt`):

```markdown
## Què inclou
- [x] Substituir el `README.md` generat per Angular pel de MotorLab
- [x] Afegir al mateix README la secció de com arrancar backend i frontend

## Com provar-ho
- Algú que clone el repositori pot arrancar backend i frontend seguint només els README

## Checklist
- [ ] `npm run build` sense errors
- [ ] Les proves passen (`npm test -- --watch=false`), si el pas en té
- [ ] No es puja cap contrasenya, secret ni `.env`

Closes #N
```

Després de fusionar: `git checkout main && git pull && git branch -d feature/fe-30-readme-frontend`

---

## Annex A · Llista de fitxers i components per carpetes

Marca cada casella quan estiga creat, revisat i compilant. Al costat, el pas on es genera. Ruta base: `src/app/` (salvo que s'indique altra cosa).

### Arrel del repositori del frontend (8)

- [ ] `package.json` · pas F01
- [ ] `angular.json` · pas F01
- [ ] `tsconfig.json` · pas F01
- [ ] `src/` · pas F01
- [ ] `proxy.conf.json` · pas F02
- [ ] `environment.ts` · pas F02
- [ ] `environment.development.ts` · pas F02
- [ ] `README.md` · pas F30

### `styles` (4)

- [ ] `_tokens.scss` · pas F03
- [ ] `_base.scss` · pas F03
- [ ] `_componentes.scss` · pas F03
- [ ] `styles.scss` · pas F03

### `features/estilos` (1)

- [ ] `EstilosComponent` · pas F03

### `core/models` (12)

- [ ] `tipos.model.ts` · pas F04
- [ ] `usuario.model.ts` · pas F04
- [ ] `vehiculo.model.ts` · pas F04
- [ ] `orden.model.ts` · pas F04
- [ ] `presupuesto.model.ts` · pas F04
- [ ] `pieza.model.ts` · pas F04
- [ ] `notificacion.model.ts` · pas F04
- [ ] `panel.model.ts` · pas F04
- [ ] `pagina.model.ts` · pas F04
- [ ] `api-error.model.ts` · pas F04
- [ ] `etiquetas.ts` · pas F04
- [ ] `index.ts` · pas F04

### `core/util` (10)

- [ ] `estados.ts` · pas F04
- [ ] `estados.spec.ts` · pas F04
- [ ] `api-error.ts` · pas F06
- [ ] `rutas.ts` · pas F09
- [ ] `formularios.ts` · pas F10
- [ ] `validadores.ts` · pas F10
- [ ] `formularios.spec.ts` · pas F10
- [ ] `validadores.spec.ts` · pas F10
- [ ] `matricula.ts` · pas F12
- [ ] `matricula.spec.ts` · pas F12

### `core/services` (23)

- [ ] `AuthService` · pas F05
- [ ] `auth.service.spec.ts` · pas F05
- [ ] `ToastService` · pas F07
- [ ] `VehiculosService` · pas F12
- [ ] `vehiculos.service.spec.ts` · pas F12
- [ ] `OrdenesService` · pas F13
- [ ] `ordenes.service.spec.ts` · pas F13
- [ ] `PresupuestosService` · pas F16
- [ ] `presupuestos.service.spec.ts` · pas F16
- [ ] `NotificacionesService` · pas F17
- [ ] `NotificacionesContadorService` · pas F17
- [ ] `UsuariosService` · pas F19
- [ ] `usuarios.service.spec.ts` · pas F19
- [ ] `OrdenesService` · pas F20
- [ ] `(asignar,` · pas F20
- [ ] `cambiarEstado)` · pas F20
- [ ] `PiezasService` · pas F21
- [ ] `piezas.service.spec.ts` · pas F21
- [ ] `PiezasService` · pas F22
- [ ] `(escritura)` · pas F22
- [ ] `PanelService` · pas F25
- [ ] `panel.service.spec.ts` · pas F25
- [ ] `GestorErrores` · pas F26

### `core/interceptors` (4)

- [ ] `auth.interceptor.ts` · pas F06
- [ ] `error.interceptor.ts` · pas F06
- [ ] `auth.interceptor.spec.ts` · pas F06
- [ ] `error.interceptor.spec.ts` · pas F06

### `shared/components` (14)

- [ ] `ToastContenedorComponent` · pas F07
- [ ] `PillEstadoComponent` · pas F08
- [ ] `PillUrgenciaComponent` · pas F08
- [ ] `BarraProgresoComponent` · pas F08
- [ ] `CargandoComponent` · pas F08
- [ ] `VacioComponent` · pas F08
- [ ] `PaginadorComponent` · pas F08
- [ ] `ModalConfirmacionComponent` · pas F08
- [ ] `ErroresCampoComponent` · pas F08
- [ ] `PendienteComponent` · pas F09
- [ ] `LineaTiempoComponent` · pas F15
- [ ] `MatriculaComponent` · pas F20
- [ ] `Error403Component` · pas F26
- [ ] `Error404Component` · pas F26

### `shared/pipes` (2)

- [ ] `EurosPipe` · pas F07
- [ ] `FechaHoraPipe` · pas F07

### `core/guards` (4)

- [ ] `authGuard` · pas F09
- [ ] `rolGuard` · pas F09
- [ ] `invitadoGuard` · pas F09
- [ ] `guards.spec.ts` · pas F09

### `app` (1)

- [ ] `app.routes.ts` · pas F09

### `features/auth` (4)

- [ ] `LoginComponent` · pas F10
- [ ] `RegistroComponent` · pas F10
- [ ] `login.component.spec.ts` · pas F10
- [ ] `registro.component.spec.ts` · pas F10

### `layouts` (2)

- [ ] `ClienteLayoutComponent` · pas F11
- [ ] `TallerLayoutComponent` · pas F11

### `features/vehiculos` (3)

- [ ] `VehiculosListaComponent` · pas F12
- [ ] `VehiculoFormComponent` · pas F12
- [ ] `VehiculoHistorialComponent` · pas F14

### `features/ordenes` (4)

- [ ] `SolicitudNuevaComponent` · pas F13
- [ ] `solicitud-nueva.component.spec.ts` · pas F13
- [ ] `OrdenesListaClienteComponent` · pas F14
- [ ] `OrdenDetalleClienteComponent` · pas F15

### `features/presupuestos` (1)

- [ ] `PresupuestoClienteComponent` · pas F16

### `features/notificaciones` (1)

- [ ] `AvisosComponent` · pas F17

### `features/perfil` (1)

- [ ] `PerfilComponent` · pas F18

### `features/taller/solicitudes` (1)

- [ ] `SolicitudesListaComponent` · pas F19

### `features/taller/orden-detalle` (1)

- [ ] `OrdenDetalleTallerComponent` · pas F20

### `features/taller/presupuesto-editor` (2)

- [ ] `LineaDialogComponent` · pas F21
- [ ] `PresupuestoEditorComponent` · pas F21

### `features/taller/piezas` (3)

- [ ] `PiezasListaComponent` · pas F22
- [ ] `PiezaDialogComponent` · pas F22
- [ ] `StockDialogComponent` · pas F22

### `features/taller/mecanico` (2)

- [ ] `MisOrdenesMecanicoComponent` · pas F23
- [ ] `OrdenMecanicoComponent` · pas F23

### `features/taller/usuarios` (2)

- [ ] `UsuariosListaComponent` · pas F24
- [ ] `UsuarioDialogComponent` · pas F24

### `features/taller/panel` (1)

- [ ] `PanelComponent` · pas F25

### `docs` (1)

- [ ] `pruebas_manuales_frontend.md` · pas F27

### `scripts` (1)

- [ ] `build-frontend.sh` · pas F29

### `controller` (1)

- [ ] `SpaForwardController` · pas F29

---

## Annex B · Decisions del frontend

1. **Interfícies en `camelCase`**, idèntiques al JSON de l'API (`MotorLab-API.json`): cap mapatge entre l'API i la interfície. Els valors dels enumerats conserven el guió baix (`aceite_filtros`).
2. **Token JWT a `localStorage`** (clau `motorlab.token`). És còmode (la sessió sobreviu a recarregar), però un atac XSS podria llegir-lo; per això es valida tot l'HTML i no s'usa `innerHTML`. Alternativa més estricta: `sessionStorage`.
3. **Paginació base 1** (`pagina`, `limite`), com el backend.
4. **Activas / Historial** de les ordres del client es reparteixen **al client** (el backend només filtra per un estat): es demanen fins a 100 ordres.
5. **Avisos per consulta periòdica** (*polling*) cada 30 segons; es pausa quan la pestanya està oculta.
6. **Proxy en desenvolupament** (`proxy.conf.json`): no cal CORS. En producció, o es serveix des de Spring Boot (F29) o es configura un servidor web que faça de proxy.
7. **Cap llibreria de components**: estils SCSS propis amb els tokens de les maquetes.
8. **Pantalla d'inici per rol:** client → `/cliente/ordenes`, administrador → `/taller/solicitudes`, mecànic → `/taller/mis-ordenes`.
9. **Imports com a `number`**, sempre formatats amb `EurosPipe`; mai es calculen al client.
10. **`datetime-local`** per a la data estimada: s'afig `:00` abans d'enviar-la (`LocalDateTime` sense zona).
11. **Errors del servidor als camps:** els controls dels formularis usen els mateixos noms `camelCase` que `detalles[].campo`.
12. **Convenció de noms amb sufixos** (`...Component`, `...Service`) perquè la guia i el codi coincidisquen.

---

## Annex C · Crear les 30 issues amb GitHub CLI (opcional)

Amb GitHub CLI instal·lat i `gh auth login` fet, el script `crear_issues_frontend_motorlab.sh` crea les 30 issues **en ordre**, i escriu el número real de cadascuna a `issues_frontend.txt`. Executa'l des de l'arrel del repositori, a Git Bash:

```bash
bash crear_issues_frontend_motorlab.sh
cat issues_frontend.txt
```

Afig `issues_frontend.txt` al `.gitignore`. Cada línia té el format `F05 #72 [Frontend] ...`: ahí tens el número de la issue per al `Closes #N` de la seua PR.
