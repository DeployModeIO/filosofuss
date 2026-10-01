# filosofuss — React + Vite + TypeScript → build estático servido por nginx.

# Endurecimiento Task D7 (cierra SEC-12/13/14/22/23 · H-01/H-02 · B-01/B-02):
#   - CSP estricta + cabeceras de seguridad (nginx).
#   - nginx sin privilegios (usuario `nginx`, escucha en :8080).
#   - bases pinadas por digest (manifest list multi-arch).
#
# La CSP autoriza los bloques inline de index.html por hash SHA-256:
#   <script> tema : sha256-VesKSSPTJrfqH9bXSCOXkoKVHg+NQXq1w0IfVEfjZBc=
#   <style>  base : sha256-uYwh0FQbT+aOFjQ+DCKP20cjnGFNyym1rTeO3Weru8k=
# Si se editan esos bloques, recalcula y actualiza los hashes en
# /etc/nginx/snippets/security-headers.conf (más abajo).

# ---- Stage 1: build ----
FROM node:22.20.0-alpine3.21@sha256:f40aebdd0c1959821ab6d72daecafb2cd1d4c9a958e9952c1d71b84d4458f875 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: runtime (nginx sin privilegios) ----
FROM nginx:1.27.4-alpine@sha256:4ff102c5d78d254a6f0da062b3cf39eaf07f01eec0927fd21e219d0af8bc0591

COPY --from=build /app/dist /usr/share/nginx/html

# nginx.conf propio: pid y rutas temporales en /tmp (escribibles por el usuario
# `nginx`) y logs a stdout/stderr. Sin directiva `user` (no re-cambia usuario).
RUN printf 'worker_processes auto;\n\
error_log /dev/stderr warn;\n\
pid /tmp/nginx.pid;\n\
\n\
events {\n\
    worker_connections 1024;\n\
}\n\
\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    access_log /dev/stdout;\n\
    sendfile on;\n\
    keepalive_timeout 65;\n\
\n\
    client_body_temp_path /tmp/nginx/client_temp;\n\
    proxy_temp_path /tmp/nginx/proxy_temp;\n\
    fastcgi_temp_path /tmp/nginx/fastcgi_temp;\n\
    uwsgi_temp_path /tmp/nginx/uwsgi_temp;\n\
    scgi_temp_path /tmp/nginx/scgi_temp;\n\
\n\
    include /etc/nginx/conf.d/*.conf;\n\
}\n' > /etc/nginx/nginx.conf

# Cabeceras de seguridad / CSP, en un snippet reutilizable: `add_header` no se
# hereda si el bloque hijo define alguno, así que se incluye en el server y en
# cada `location` (ver default.conf).
RUN mkdir -p /etc/nginx/snippets && printf 'add_header Content-Security-Policy "default-src \047self\047; script-src \047self\047 \047sha256-VesKSSPTJrfqH9bXSCOXkoKVHg+NQXq1w0IfVEfjZBc=\047; script-src-attr \047none\047; style-src \047self\047 \047sha256-uYwh0FQbT+aOFjQ+DCKP20cjnGFNyym1rTeO3Weru8k=\047; style-src-attr \047unsafe-inline\047; font-src \047self\047; img-src \047self\047 data:; media-src \047self\047; connect-src \047self\047; worker-src \047self\047; manifest-src \047self\047; base-uri \047self\047; object-src \047none\047; frame-ancestors \047none\047; form-action \047self\047; upgrade-insecure-requests" always;\n\
add_header X-Content-Type-Options "nosniff" always;\n\
add_header X-Frame-Options "DENY" always;\n\
add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;\n\
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;\n\
add_header Cross-Origin-Opener-Policy "same-origin" always;\n' > /etc/nginx/snippets/security-headers.conf

# Server SPA: fallback a index.html, server_tokens off, cache por tipo de recurso.
RUN printf 'server {\n\
    listen 8080;\n\
    server_name _;\n\
\n\
    server_tokens off;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    include /etc/nginx/snippets/security-headers.conf;\n\
\n\
    location = / {\n\
        include /etc/nginx/snippets/security-headers.conf;\n\
        add_header Cache-Control "no-cache" always;\n\
    }\n\
\n\
    location = /index.html {\n\
        include /etc/nginx/snippets/security-headers.conf;\n\
        add_header Cache-Control "no-cache" always;\n\
    }\n\
\n\
    location = /sw.js {\n\
        include /etc/nginx/snippets/security-headers.conf;\n\
        add_header Cache-Control "no-cache" always;\n\
    }\n\
\n\
    location = /manifest.webmanifest {\n\
        include /etc/nginx/snippets/security-headers.conf;\n\
        add_header Cache-Control "no-cache" always;\n\
        types { application/manifest+json webmanifest; }\n\
    }\n\
\n\
    location /assets/ {\n\
        include /etc/nginx/snippets/security-headers.conf;\n\
        add_header Cache-Control "public, max-age=31536000, immutable" always;\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Directorio temporal escribible por el usuario nginx.
RUN mkdir -p /tmp/nginx && chown -R nginx:nginx /tmp/nginx

EXPOSE 8080

USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
