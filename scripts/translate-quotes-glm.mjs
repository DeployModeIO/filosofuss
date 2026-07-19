// Traduce las citas de Filosofuss (es → en) usando Zhipu AI (GLM).
//
// Uso:
//   1. Copia .env.example a .env y pon tu GLM_API_KEY (ver .env.example).
//   2. node scripts/translate-quotes-glm.mjs
//      Opcional: --limit N   (traducir solo las primeras N citas)
//                --force     (rehacer aunque ya exista la traducción)
//
// Notas:
//   - ES JavaScript puro: NO importa archivos .ts (el proyecto no tiene tsx).
//     En su lugar parsea src/data/quotes.ts y src/data/quotesBatch*.ts para
//     extraer id / text / source con regex.
//   - Reanudable: guarda progreso en scripts/.translate-progress.json y retoma
//     si se interrumpe. Las citas ya traducidas no se repiten.
//   - Escribe src/data/quotesEn.ts con el formato que espera el tipo QuoteEn.

import { readFile, writeFile, appendFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PROGRESS_PATH = resolve(__dirname, ".translate-progress.json");
const OUT_PATH = resolve(ROOT, "src/data/quotesEn.ts");

// ─── Config desde entorno ───────────────────────────────────────────────
const API_KEY = process.env.GLM_API_KEY ?? "";
const MODEL = process.env.GLM_MODEL || "glm-4.5-flash";
const LIMIT = process.argv.includes("--limit")
  ? Number(process.argv[process.argv.indexOf("--limit") + 1])
  : Infinity;
const FORCE = process.argv.includes("--force");

const ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const REQUESTS_PER_MIN = 20;
const RETRIES = 4;
const LOG_PATH = resolve(__dirname, "translate-quotes.log");

// ─── Utilidades ─────────────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFile(LOG_PATH, line + "\n").catch(() => {});
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Extrae objetos {id, text, source?} parseando el texto de un archivo .ts.
function parseQuotes(content) {
  const out = [];
  const idRe = /id:\s*["']([^"']+)["']/g;
  const hits = [];
  let m;
  while ((m = idRe.exec(content)) !== null) {
    hits.push({ index: m.index, id: m[1] });
  }
  for (let i = 0; i < hits.length; i++) {
    const start = hits[i].index;
    const end = i + 1 < hits.length ? hits[i + 1].index : content.length;
    const chunk = content.slice(start, end);
    const text = chunk.match(/text:\s*["']([^"']*)["']/)?.[1];
    if (!text) continue;
    const source = chunk.match(/source:\s*["']([^"']*)["']/)?.[1];
    out.push({ id: hits[i].id, text, source });
  }
  return out;
}

async function loadAllQuotes() {
  const files = ["src/data/quotes.ts", ...readdirSync("src/data")
    .filter((f) => f.startsWith("quotesBatch") && f.endsWith(".ts"))
    .map((f) => "src/data/" + f)];
  const seen = new Set();
  const all = [];
  for (const rel of files) {
    const c = await readFile(resolve(ROOT, rel), "utf8");
    for (const q of parseQuotes(c)) {
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      all.push(q);
    }
  }
  return all;
}

async function loadProgress() {
  if (!existsSync(PROGRESS_PATH)) return {};
  try {
    const raw = await readFile(PROGRESS_PATH, "utf8");
    const arr = JSON.parse(raw);
    return Object.fromEntries(arr.map((q) => [q.id, q]));
  } catch {
    return {};
  }
}

async function saveProgress(map) {
  await writeFile(PROGRESS_PATH, JSON.stringify(Object.values(map), null, 2));
}

function buildMessages(batch) {
  const items = batch
    .map((q, i) => {
      const src = q.source ? ` | SOURCE: ${q.source}` : "";
      return `${i + 1}. ID:${q.id} | ES:${q.text}${src}`;
    })
    .join("\n");

  return [
    {
      role: "system",
      content:
        "You are a literary translator specializing in classical and modern philosophical aphorisms. " +
        "Translate each Spanish aphorism into fluent, natural English suitable for quotation. " +
        "Preserve the philosophical tone and meaning. Keep proper names (authors, works) in their " +
        "standard English form (e.g. 'Así habló Zaratustra' -> 'Thus Spoke Zarathustra'). " +
        "Do NOT add commentary. Respond ONLY with a JSON object of the form " +
        '{"translations": [ { "id": string, "text": string (English), "source": string|null } ]} ' +
        "in the same order. Output must be valid JSON, no markdown fences.",
    },
    { role: "user", content: items },
  ];
}

async function callGLM(batch) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: buildMessages(batch),
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (res.status === 429) {
        log(`429 rate-limited, esperando 30s (intento ${attempt})`);
        await sleep(30000);
        continue;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(content);
      const list = parsed.translations ?? [];
      if (!Array.isArray(list) || list.length !== batch.length) {
        throw new Error(`se esperaban ${batch.length}, llegaron ${list.length}`);
      }
      for (const item of list) {
        if (!item.id || !item.text) {
          throw new Error("entrada incompleta: falta id o text");
        }
      }
      return list;
    } catch (err) {
      log(`Error (intento ${attempt}/${RETRIES}): ${err.message}`);
      await sleep(attempt * 5000);
    }
  }
  throw new Error("Agotados los reintentos para un lote");
}

function renderFile(map) {
  const list = Object.values(map).sort((a, b) => a.id.localeCompare(b.id));
  const entries = list
    .map((q) => {
      const src = q.source
        ? `,\n    source: ${JSON.stringify(q.source)}`
        : "";
      return `  {\n    id: ${JSON.stringify(q.id)},\n    text: ${JSON.stringify(q.text)}${src},\n  }`;
    })
    .join(",\n");
  return (
    "// Traducciones al inglés de las citas (Fase 2).\n" +
    "// Este archivo es GENERADO por scripts/translate-quotes-glm.mjs — no editar a mano.\n" +
    "// Cada entrada enlaza con Quote.id y aporta el texto y (opcionalmente) el source en inglés.\n" +
    'import type { QuoteEn } from "@/types"\n\n' +
    "export const quotesEn: QuoteEn[] = [\n" +
    entries +
    "\n]\n\n" +
    "/** Mapa id → traducción para búsqueda O(1). */\n" +
    "export const quoteEnById: Record<string, QuoteEn> = Object.fromEntries(\n" +
    "  quotesEn.map((q) => [q.id, q]),\n" +
    ")\n"
  );
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error("ERROR: define GLM_API_KEY en el archivo .env");
    process.exit(1);
  }

  const all = await loadAllQuotes();
  const progress = await loadProgress();
  const pending = all.filter((q) => FORCE || !progress[q.id]).slice(0, LIMIT);

  log(`Total citas: ${all.length} | pendientes: ${pending.length}`);
  if (pending.length === 0) {
    log("Nada que traducir. Usa --force para rehacer todo.");
    await writeFile(OUT_PATH, renderFile(progress));
    return;
  }

  const BATCH = 10;
  let done = 0;

  for (let i = 0; i < pending.length; i += BATCH) {
    const slice = pending.slice(i, i + BATCH);
    try {
      const translated = await callGLM(slice);
      for (const t of translated) {
        progress[t.id] = {
          id: t.id,
          text: t.text,
          source: t.source ?? undefined,
        };
      }
      await saveProgress(progress);
      done += translated.length;
      log(`Progreso: ${done}/${pending.length} (total ${Object.keys(progress).length})`);
    } catch (err) {
      log(`FALLO lote ${i}-${i + slice.length}: ${err.message}`);
      log("Reintentando el lote en 15s...");
      await sleep(15000);
      i -= BATCH;
      continue;
    }
    if (i + BATCH < pending.length) await sleep((60000 / REQUESTS_PER_MIN) | 0);
  }

  await writeFile(OUT_PATH, renderFile(progress));
  log(`✔ Completado. ${Object.keys(progress).length} traducciones en ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
