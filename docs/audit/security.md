# Auditoría de Seguridad — Filosofuss

- **Proyecto:** `/home/deploymodeio/proyectos/filosofuss`
- **Stack:** React 18 + TypeScript + Vite + Tailwind + Framer Motion + Capacitor Android
- **Rama auditada:** `nivel-dios` (sin cambios, auditoría 100% READ-ONLY)
- **Fecha:** 2026-09-30
- **Alcance:** dependencias, secretos, XSS/injection, CSP y cabeceras HTTP, Capacitor/Android, supply-chain/build y service worker.
- **Estado del entorno:** `node_modules` presente y registro npm accesible. `npm audit --json` y `npm audit --package-lock-only --json` devuelven exactamente el mismo resultado (11 vulnerabilidades), por lo que no fue necesario derivar CVEs manualmente.

---

## Resumen ejecutivo

- **0 Críticos.**
- **7 Altos** (todas en el árbol de dependencias; 2 directas de build: `postcss`, `vite`; 5 transitivas).
- **12 Medios** (incluye `react-router-dom` productiva, ausencia de CSP/cabeceras, configuración Android de release y supply-chain).
- **9 Bajos.**
- **6 controles verificados sin hallazgo** (secreto limpio, XSS limpio, `npm ci`, `.dockerignore`, scope del SW).

**Conclusión:** No hay secretos filtrados, no hay sinks de XSS en el código propio y el manifiesto Android es restrictivo (solo `INTERNET`). El riesgo principal es la **ausencia total de CSP y cabeceras de seguridad** en nginx, seguida de la **vulnerabilidad de open-redirect → XSS en `react-router-dom@6.30.4`** (única dependencia productiva directa vulnerable) y del **toolchain de build desactualizado**.

---

## Tabla de hallazgos

| ID | Hallazgo | Severidad | Evidencia (archivo:línea / comando) | Impacto | Esfuerzo | Recomendación |
|----|----------|-----------|--------------------------------------|---------|----------|---------------|
| D-01 | `postcss@8.5.16` — path traversal en auto-carga de `sourceMappingURL` (lectura arbitraria de `.map`) | Alto | `package-lock.json` (postcss 8.5.16); `npm audit --json` → `postcss`, sev `high`, range `<=8.5.22`, `fixAvailable:true` | Fuga de archivos en build (dev/build-time) | S | Subir `postcss` a `>=8.5.23` (`npm audit fix` / bump en `package.json`) |
| D-02 | `vite@5.4.21` — path traversal en `.map`, bypass de `server.fs.deny`, divulgación de hash NTLMv2 (`launch-editor`) | Alto | `package-lock.json` (vite 5.4.21); audit: `vite` `high`, range `<=6.4.2`, fix `8.3.1` (`isSemVerMajor`) | Fuga de ficheros del servidor dev; exposición de hashes en Windows | M | Actualizar a Vite `8.x` (mayor) o aplicar parche de rama soportada; no exponer el dev server en red |
| D-03 | `@xmldom/xmldom@0.9.10` — 12 advisories de inyección XML / DoS cuadrático | Alto | `package-lock.json`; ruta: `@capacitor/cli → plist → @xmldom/xmldom`; audit sev `high` | DoS e inyección durante tooling Capacitor | S | Actualizar `@capacitor/cli` / `plist` para arrastrar `@xmldom/xmldom` corregido |
| D-04 | `tar@7.5.19` — stack overflow no capturable (DoS) con tar malicioso | Alto | `package-lock.json`; ruta `@capacitor/cli → tar`; audit sev `high`, range `<=7.5.20` | DoS en pipeline de build | S | Actualizar la cadena de `@capacitor/cli` |
| D-05 | `brace-expansion@5.0.7` — DoS por recursión/expansión sin límite | Alto | `package-lock.json`; ruta `minimatch → brace-expansion`; audit sev `high`, range `4.0.0 - 5.0.11` | DoS en tooling con patrones controlables | S | `npm audit fix` / actualizar `minimatch` |
| D-06 | `browserslist@4.28.5` — crecimiento de memoria y escritura de prototipo vía stats no confiables | Alto | `package-lock.json`; ruta `autoprefixer`/`@babel/* → browserslist`; audit sev `high`, range `<=4.28.6` | OOM/DoS en build | S | `npm audit fix` |
| D-07 | `nanoid@3.3.15` — bucle indefinido con tamaño negativo/cero | Alto | `package-lock.json`; ruta `postcss → nanoid`; audit sev `high`, range `<=3.3.17` | DoS en build | S | `npm audit fix` |
| D-08 | `esbuild@0.21.5` — cualquier web puede enviar peticiones al dev server y leer la respuesta | Medio | `package-lock.json`; ruta `vite → esbuild`; audit sev `moderate`, GHSA-67mh-4wv8-2f99 | Fuga de código fuente si el dev server queda expuesto | M | Ligado a actualizar Vite; no exponer dev server |
| D-09 | `baseline-browser-mapping@2.10.42` — terminación de proceso ante input inválido (DoS) | Medio | `package-lock.json`; ruta `browserslist → baseline-browser-mapping`; audit sev `moderate` | DoS en build | S | Actualizar `browserslist` |
| D-10 | `react-router-dom@6.30.4` / `react-router@6.30.4` — open redirect → XSS y constructor injection | Medio (potencial Alto) | `package.json` (`react-router-dom ^6.26.0`), `package-lock.json` 6.30.4; audit GHSA-jjmj-jmhj-qwj2, GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg | **Única vulnerabilidad de runtime en dependencia directa productiva.** Open redirect en `<Link>`/`useNavigate` es vector de XSS/redirect phishing | M | Subir `react-router-dom` a `6.30.6` (o `7.18.4`); hoy `wanted=6.30.6` |
| D-11 | Versiones mayores desactualizadas (react 19, vite 8, tailwind 4, framer-motion 13, typescript 7, lucide 1.x, react-router 7) | Bajo | `npm outdated --json` (18 paquetes) | Superficie de deuda/seguridad a futuro | L | Planificar upgrades mayores por fases |
| S-01 | **Sin secretos hardcodeados.** No hay claves/API keys/tokens en el repo | Informativo (limpio) | Ver sección "Secretos" (grep + `git log -S`) | — | — | Mantener |
| X-01 | **Sin sinks peligrosos** de XSS (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`) | Informativo (limpio) | grep en `src/` y `public/` → sin coincidencias | — | — | Mantener |
| X-02 | `window.open(..., '_blank', 'noopener,noreferrer')` correcto | Informativo (limpio) | `src/components/quotes/QuoteCard.tsx:170` | — | — | Mantener |
| X-03 | `audio.src` se construye con `quoteId` validado contra allowlist del manifiesto | Informativo (limpio) | `src/context/NarrationContext.tsx:163-169`, `src/data/voiceManifest.ts` (`getNarrationSrc`) | — | — | Mantener |
| X-04 | Google Fonts cargado remotamente sin SRI (CSS dinámico, no admite SRI) | Bajo | `index.html:45-51`; `public/sw.js:88-106` | Dependencia de terceros / supply chain | S | Self-host de fuentes o `font-src` restrictivo en CSP |
| H-01 | **No existe Content-Security-Policy** (ni en `index.html` ni en nginx) | Medio | `index.html` (sin `<meta http-equiv="Content-Security-Policy">`); `Dockerfile:20-26` (server block sin `add_header`) | Sin mitigación de XSS/inyección de terceros | M | Añadir CSP en nginx (ver sección H-01) |
| H-02 | Faltan `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, HSTS | Medio | `Dockerfile:20-26` (única config nginx, sin cabeceras) | Clickjacking, MIME sniffing, fuga de referrer, downgrade | S | Añadir bloque `add_header` (ver sección H-02) |
| H-03 | nginx divulga versión (`server_tokens` por defecto `on`) | Bajo | `Dockerfile:15,20-26` | Fingerprinting del servidor | S | `server_tokens off;` |
| H-04 | `index.html` contiene `<script>` inline (bootstrap de tema) y `<style>` inline que una CSP estricta debe permitir | Medio | `index.html:53-83` (`<style>`), `index.html:85-99` (`<script>`) | Bloqueo de la app si se aplica CSP sin hash/nonce | S | Hash SHA-256 o `nonce` para el script; `style-src 'unsafe-inline'` o mover estilos |
| A-01 | Android release con `minifyEnabled false` (sin R8/obfuscación) | Medio | `android/app/build.gradle:21` | Ingeniería inversa más fácil; binario mayor | S | `minifyEnabled true` + reglas ProGuard |
| A-02 | `android:allowBackup="true"` | Bajo | `android/app/src/main/AndroidManifest.xml:5` | Extracción de datos de app por `adb backup` | S | `allowBackup="false"` o reglas de backup |
| A-03 | `file_paths.xml` expone `external-path "."` y `cache-path "."` (FileProvider demasiado amplio) | Medio | `android/app/src/main/res/xml/file_paths.xml:3-4` | Si algún flujo comparte `content://`, podría exponer todo el almacenamiento externo/caché | S | Restringir a subdirectorios concretos |
| A-04 | No hay `signingConfig` de release (riesgo de firma debug / APK sin firmar) | Medio | `android/app/build.gradle:19-24` (release sin `signingConfig`) | Distribución con firma no controlada | M | Configurar keystore de release + `signingConfigs` |
| A-05 | Sin `network_security_config` explícito | Bajo | No existe `res/xml/network_security_config.xml`; `AndroidManifest.xml` no lo referencia | `usesCleartextTraffic` no definido → cleartext bloqueado por defecto en targetSdk 36 (**OK**), pero sin política explícita | S | Añadir `network_security_config.xml` con `cleartextTrafficPermitted="false"` |
| A-06 | `capacitor.config.ts` sin `server.androidScheme` explícito | Bajo | `capacitor.config.ts:1-9` (sin bloque `server`) | El default es `https` (**seguro**), pero conviene fijarlo | S | Añadir `server: { androidScheme: 'https' }` |
| A-07 | Gradle wrapper sin `distributionSha256Sum` | Bajo | `android/gradle/wrapper/gradle-wrapper.properties:3` | Descarga de Gradle sin verificación de integridad | S | Añadir `distributionSha256Sum` |
| B-01 | Imágenes base sin pin por digest | Medio | `Dockerfile:4` (`node:22-alpine`), `Dockerfile:15` (`nginx:1.27-alpine`) | Reproducibilidad/supply chain (tags mutables) | S | Pin `@sha256:...` |
| B-02 | nginx corre como root | Medio | `Dockerfile:15,33` (imagen `nginx:*` por defecto, sin `USER`) | Escalada de privilegios si se compromete el server | M | `USER nginx` + listen en `8080` (o imagen `nginx-unprivileged`) |
| B-03 | 6 binarios `.exe` de Windows comiteados y no usados por el código | Medio | `git ls-files scripts/` → `edge-tts.exe`, `edge-playback.exe`, `idna.exe`, `pip3.exe`, `pip3.14.exe`, `tabulate.exe`; `scripts/generate-voices.mjs:137-157` detecta `edge-tts` del PATH, no estos `.exe` | Supply chain / portabilidad / bloat; binarios opacos en el repo | S | Eliminar del repo; instalar `edge-tts` vía `pip` |
| B-04 | `npm ci` + `.dockerignore` correcto + `.env` excluido del contexto e imagen | Informativo (limpio) | `Dockerfile:9` (`npm ci`); `.dockerignore:1,4,6,7`; `.gitignore:18-20` | — | — | Mantener |
| W-01 | Rama de navegación del SW cachea la respuesta **sin comprobar `fresh.ok`** → puede guardar una página de error/redirect como app shell | Medio | `public/sw.js:65-84` (en `:71` hace `cache.put('/index.html', fresh.clone())` sin validar status) | Servir HTML erróneo offline / envenenamiento de caché local | S | Cachear solo si `fresh.ok` y `content-type` HTML |
| W-02 | SWR cachea **todas** las GET de mismo origen sin lista de exclusión y con caché fijo `filosofuss-v1` | Bajo | `public/sw.js:108-128`; `public/sw.js:11` | Caché amplia; busting de versión depende de cambiar el nombre | S | Excluir `/sw.js` y rutas sensibles; versionar caché por build |
| W-03 | Se cachean respuestas de Google Fonts cross-origin sin integridad | Bajo | `public/sw.js:88-106` | Respuesta de terceros persistida | S | Revisar/limitar `font-src` |
| W-04 | Scope `/` y `start_url` `/` correctos | Informativo (limpio) | `public/manifest.webmanifest:7-8`; registro en `src/main.tsx:18` | — | — | Mantener |

**Conteo:** Crítico **0** · Alto **7** · Medio **12** · Bajo **9** · Informativo/limpio **6**.

---

## Hallazgos ALTOS — detalle y corrección

> Evidencia común: ambas ejecuciones de auditoría coinciden.
> ```
> $ npm audit --package-lock-only --json
> $ npm audit --json
> metadata: {"info":0,"low":0,"moderate":4,"high":7,"critical":0,"total":11}
> ```

### D-01 — postcss (path traversal en sourceMappingURL)
**Evidencia:** `package-lock.json` fija `postcss@8.5.16`. `npm audit` reporta `postcss` severidad `high`, rango vulnerable `<=8.5.22`, GHSA-r28c-9q8g-f849 y GHSA-fxqj-rqcc-2cmp, `fixAvailable:true`. Es **dependencia directa de desarrollo** (`package.json` `devDependencies.postcss`).
**Reproducción:** `npm audit --json | node -e '...'` (ver D-01 en la tabla).
**Fix:** actualizar a `postcss >= 8.5.23` (`npm audit fix` o bump manual).

### D-02 — vite (path traversal / fs.deny bypass / NTLMv2)
**Evidencia:** `package-lock.json` `vite@5.4.21`. Advisories GHSA-4w7w-66w2-5vf9, GHSA-fx2h-pf6j-xcff, GHSA-v6wh-96g9-6wx3. `fixAvailable: {name:"vite", version:"8.3.1", isSemVerMajor:true}`.
**Reproducción:** `npm outdated --json` → `vite current=5.4.21 wanted=5.4.21 latest=8.3.1`.
**Fix:** migrar a Vite 8 (mayor) y, mientras tanto, no exponer `vite dev` fuera de `localhost`.

### D-03 — @xmldom/xmldom
**Evidencia:** instalado `0.9.10` (`package-lock.json`), ruta `node_modules/plist (@xmldom/xmldom:^0.9.10)` ← `@capacitor/cli`. 12 advisories de inyección XML y DoS cuadrático (GHSA-6gmq-8vp8-gcm6, GHSA-27p8-2357-5qqv, GHSA-965w-775f-mr7g, etc.).
**Fix:** actualizar `@capacitor/cli`/`plist`.

### D-04 — tar
**Evidencia:** `tar@7.5.19`, ruta `@capacitor/cli → tar:^7.5.3`. GHSA-r292-9mhp-454m (stack overflow DoS). Rango `<=7.5.20`.
**Fix:** actualizar la cadena de `@capacitor/cli`.

### D-05 — brace-expansion
**Evidencia:** `brace-expansion@5.0.7`, ruta `minimatch → brace-expansion:^5.0.5`. GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p, GHSA-q2hr-2g5m-vwhr. Rango `4.0.0 - 5.0.11`.
**Fix:** `npm audit fix`.

### D-06 — browserslist
**Evidencia:** `browserslist@4.28.5`, rutas `autoprefixer → browserslist:^4.28.4` y `@babel/helper-compilation-targets`. GHSA-c83g-rgw3-j3cx (OOM), GHSA-73wf-gq98-2v4g (prototype write). Rango `<=4.28.6`.
**Fix:** `npm audit fix`.

### D-07 — nanoid
**Evidencia:** `nanoid@3.3.15`, ruta `postcss → nanoid:^3.3.12`. GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8. Rango `<=3.3.17`.
**Fix:** `npm audit fix`.

---

## Detalle y corrección de hallazgos MEDIOS relevantes

### H-01 / H-02 / H-03 / H-04 — CSP y cabeceras HTTP
**Evidencia:** `index.html` no contiene CSP. La única configuración de nginx se genera en `Dockerfile:20-26` y no incluye ninguna cabecera de seguridad:
```
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / { try_files $uri $uri/ /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf
```
`index.html:85-99` tiene un `<script>` inline y `index.html:53-83` un `<style>` inline, por lo que una CSP debe contemplarlos.

**Reproducción:** `grep -n "add_header\|server_tokens" Dockerfile` → sin resultados; `grep -n "Content-Security-Policy" index.html` → sin resultados.

**Fix recomendado** (reemplazar el bloque nginx del Dockerfile):
```nginx
server {
    listen 80;
    server_name _;
    server_tokens off;
    root /usr/share/nginx/html;
    index index.html;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-<HASH_DEL_SCRIPT_INLINE>'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / { try_files $uri $uri/ /index.html; }
}
```
- Calcular el hash del script inline de `index.html:85-99` (`sha256-...`) o moverlo a un `.js` externo y usar `script-src 'self'`.
- `style-src` necesita `'unsafe-inline'` por los estilos inline (o migrarlos a clases).
- HSTS solo si se sirve por HTTPS delante (p. ej. reverse proxy/terminación TLS).

### D-10 — react-router-dom open redirect → XSS
**Evidencia:** `package.json` `"react-router-dom": "^6.26.0"`, instalado `6.30.4`. `npm audit`: GHSA-jjmj-jmhj-qwj2 (open redirect → XSS), GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg. `wanted=6.30.6`.
**Reproducción:** `npm outdated --json` → `react-router-dom current=6.30.4 wanted=6.30.6 latest=7.18.4`.
**Fix:** subir a `^6.30.6` (o 7.18.4). En este proyecto no hay `<Link>`/`useNavigate` con destino controlado por el usuario (grep sin `<a>` ni `useNavigate` en `src/`), por lo que la explotabilidad actual es baja, pero se recomienda el bump igualmente.

### A-01 / A-03 / A-04 — Configuración Android de release
- **A-01:** `android/app/build.gradle:21` → `minifyEnabled false`. Activar R8: `minifyEnabled true`, `shrinkResources true`.
- **A-03:** `android/app/src/main/res/xml/file_paths.xml:3-4` expone `external-path "."` y `cache-path "."`. Restringir a subdirectorios específicos.
- **A-04:** `android/app/build.gradle:19-24` no define `signingConfigs` para `release`. Añadir keystore de release y `signingConfig signingConfigs.release`.

### B-01 / B-02 / B-03 — Supply chain y build
- **B-01:** `Dockerfile:4` y `:15` usan tags mutables. Fijar `node:22-alpine@sha256:...` y `nginx:1.27-alpine@sha256:...`.
- **B-02:** nginx corre como root (`Dockerfile:33`). Usar `nginxinc/nginx-unprivileged` o `USER nginx` con `listen 8080`.
- **B-03:** 6 `.exe` Windows comiteados (`git ls-files scripts/`). No los usa ningún script: `scripts/generate-voices.mjs:137-157` busca `edge-tts`/`python` en el PATH. Eliminar del repo.

### W-01 — Service worker: caché de navegación sin validar estado
**Evidencia:** `public/sw.js:65-84`. En `:69-72` se hace `fetch(request)` y se almacena la respuesta como `/index.html` **sin comprobar `fresh.ok`** (a diferencia de las ramas de fuentes `:93` y mismo-origen `:117`).
**Fix:**
```js
const fresh = await fetch(request);
if (fresh && fresh.ok) {
  const cache = await caches.open(CACHE);
  cache.put('/index.html', fresh.clone()).catch(() => {});
}
return fresh;
```

---

## Secretos — resultados (limpio)

Comandos y evidencia:
```
$ ls .env                → No existe (sin fichero .env local)
$ git check-ignore -v .env   → .gitignore:18:.env    .env
$ git ls-files | grep -iE "\.env|secret|credential"  → solo .env.example
$ git log --all --oneline -S'GLM_API_KEY=' -- .     → 95bb7f7 (solo añade .env.example/script, sin valor)
$ # escaneo de TODOS los blobs históricos buscando sk-*, Bearer <token>, claves Zhipu  → 0 coincidencias
$ git log --all --diff-filter=A --name-only | grep -iE "(^|/)\.env" → .env.example
```
- `.env`, `.env.*` están ignorados y **nunca** se rastrearon (`git ls-files` solo lista `.env.example`).
- `scripts/translate-quotes-glm.mjs:28` lee la clave desde entorno: `process.env.GLM_API_KEY ?? ""`; **no hay clave hardcodeada**. El `Bearer` de la línea 135 usa esa variable.
- `scripts/generate-voices.mjs` no usa API key (Edge TTS gratuito).
- `*.log` está ignorado (`.gitignore:3`), cubriendo `scripts/translate-quotes.log`.
- **No se encontraron secretos en el historial de git ni en el árbol de trabajo.**

---

## XSS / injection — resultados (limpio)

`grep -rnE "dangerouslySetInnerHTML|innerHTML|outerHTML|eval\(|new Function|document\.write|javascript:|srcdoc" src public` → **sin coincidencias**.
- No se construye HTML con datos de usuario. React escapa por defecto.
- `QuoteDeepLink.tsx:14-20`: `?cita=` se valida con `getQuoteById(id)` antes de usarlo; luego se elimina de la URL con `history.replaceState` (no se inyecta en el DOM).
- `QuoteCard.tsx:170`: `window.open(linkedIn, '_blank', 'noopener,noreferrer')` — correcto.
- `AudioContext.tsx:75,146` y `NarrationContext.tsx:169`: `audio.src` proviene de constantes (`tracks.ts`) o de `getNarrationSrc`, que solo devuelve ruta si el `quoteId` está en la allowlist de `voiceManifest.ts`. Sin entrada arbitraria.
- `utils.ts:93-99` construye la URL de compartir con `URL`/`URLSearchParams` (sin concatenación cruda).

---

## Capacitor / Android — inventario verificado

- `AndroidManifest.xml:40` → solo permiso `INTERNET`. **No** hay `STORAGE`, `RECORD_AUDIO`, `CAMERA` ni `ACCESS_FINE_LOCATION`. ✅
- `AndroidManifest.xml:18` `android:exported="true"` solo en `MainActivity` con `LAUNCHER` (correcto y requerido). El `FileProvider` (`:27-35`) es `exported="false"`. ✅
- **No** existe `android:usesCleartextTraffic="true"` ni dominios cleartext: `targetSdk=36` (`variables.gradle:4`) bloquea cleartext por defecto. ✅
- **No** se llama `WebView.setWebContentsDebuggingEnabled` (solo `MainActivity extends BridgeActivity`, `MainActivity.java:1-5`). ✅
- `capacitor.config.ts` no define `server.url` ni `allowNavigation` (sin riesgo de navegación externa). ✅

---

## Service worker — inventario verificado

- `public/sw.js:11` caché `filosofuss-v1`; precache de app shell y 5 audios (`:14-23`).
- Navegaciones network-first con fallback offline (`:65-84`) — **ver W-01**.
- Google Fonts network-first con caché de respaldo (`:88-106`) — **ver W-03**.
- Mismo origen stale-while-revalidate (`:108-128`) — **ver W-02**.
- `manifest.webmanifest` scope `/`, `start_url` `/` (`:7-8`); registro en `src/main.tsx:16-22`. ✅

---

## Limitaciones

- **Sin pruebas dinámicas (DAST):** no se ejecutó la app ni se probaron cabeceras en un servidor vivo; la ausencia de CSP/cabeceras se determinó por inspección estática de `index.html` y del `Dockerfile`.
- **Sin compilación Android:** no se generó el APK/AAB ni se inspeccionó el binario final; `signingConfig` efectiva y `debuggable` real dependen de la configuración de build del entorno y no pueden confirmarse sin keystore.
- **`node_modules` presente:** la auditoría se ejecutó con red disponible; `npm audit --json` y `--package-lock-only --json` coinciden. No obstante, las severidades de npm no se re-calcularon con CVSS propio.
- **Binarios `.exe` no analizados:** se identificaron por `file` (Zip/PE con datos extra) pero no se desensamblaron ni se verificó su firma/entropía; se marcan por riesgo de supply chain y portabilidad.
- **Historial git escaneado de forma heurística:** se buscaron patrones de claves conocidos (`sk-`, `Bearer`, hexadecimales largos, Zhipu `id.secret`) en todos los blobs; una clave con formato atípico podría no coincidir con los patrones.
- **`react-router` D-10:** grep no encontró `<Link>`/`useNavigate` con destino controlado por el usuario, por lo que la explotabilidad real en el estado actual del código es baja; se mantiene la recomendación de actualizar.
- **`.translate-progress.json`:** ignorado por git y no presente; no analizado.
