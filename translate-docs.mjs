/**
 * translate-docs.mjs
 *
 * Translates all .mdx files from /en to a target language folder (default: /ru).
 * MDX-aware: preserves code blocks, HTML comments, JSX structure.
 * Only translates text content, frontmatter title/description, and JSX title/description props.
 * Incremental: if target file already exists, keeps lines that were already translated.
 * Also syncs docs.json navigation: mirrors EN groups to RU (or other target language).
 *
 * Usage:
 *   node translate-docs.mjs                  # Translate to ru (incremental)
 *   node translate-docs.mjs --lang=ar         # Translate to Arabic
 *   node translate-docs.mjs --force           # Retranslate everything
 *   node translate-docs.mjs --only=intro      # Translate only files matching pattern
 */

import translate from "google-translate-api-x";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = __dirname;
const EN_DIR = path.join(DOCS_ROOT, "en");
const DOCS_JSON_PATH = path.join(DOCS_ROOT, "docs.json");

const TARGET_LANG =
  process.argv.find((a) => a.startsWith("--lang="))?.split("=")[1] || "ru";
const FORCE = process.argv.includes("--force");
const ONLY_PATTERN = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

const TARGET_DIR = path.join(DOCS_ROOT, TARGET_LANG);

const RATE_LIMIT_DELAY_MS = 400;
const RATE_LIMIT_BACKOFF_MS = 10000;

// Known group name translations for docs.json navigation
// Add more as needed for each language
const GROUP_NAME_TRANSLATIONS = {
  ru: {
    "Getting Started": "Начало работы",
    "Admin Panel": "Админ-панель",
    Projects: "Проекты",
    Contacts: "Контакты",
    Leads: "Лиды",
    "Agent Network": "Сеть агентов",
    "CRM Integrations": "CRM интеграции",
    Widgets: "Виджеты",
    "Custom Domains": "Пользовательские домены",
    Analytics: "Аналитика",
    Notifications: "Уведомления",
    Subscriptions: "Подписки",
    "Partner Program": "Партнёрская программа",
    "Agent Cabinet": "Кабинет агента",
  },
  ar: {},
  ka: {},
  he: {},
  tr: {},
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** In-memory cache so the same phrase isn't sent twice */
const translationCache = new Map();

async function translateText(text, targetLang) {
  if (!text || text.trim() === "") return text;

  const cacheKey = `${targetLang}::${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const attempt = async () => {
    const res = await translate(text, { to: targetLang, forceBatch: false });
    return res.text;
  };

  try {
    const translated = await attempt();
    translationCache.set(cacheKey, translated);
    await delay(RATE_LIMIT_DELAY_MS);
    return translated;
  } catch (err) {
    const isRateLimit =
      err.message.includes("429") ||
      err.message.includes("Too Many Requests");

    if (isRateLimit) {
      console.warn(
        `   [rate-limit] waiting ${RATE_LIMIT_BACKOFF_MS / 1000}s…`
      );
      await delay(RATE_LIMIT_BACKOFF_MS);
      try {
        const translated = await attempt();
        translationCache.set(cacheKey, translated);
        await delay(RATE_LIMIT_DELAY_MS);
        return translated;
      } catch {
        /* fall through */
      }
    }

    console.error(
      `   [error] "${text.substring(0, 60)}" → ${err.message.substring(0, 80)}`
    );
    return text; // preserve original on failure
  }
}

// ---------------------------------------------------------------------------
// MDX parsing
// ---------------------------------------------------------------------------

/**
 * Classify a single line for translation purposes.
 * Returns one of:
 *   'preserve'    → copy as-is
 *   'frontmatter' → extract text, translate, reassemble
 *   'translate'   → full line needs translation
 */
function classifyLine(line, context) {
  const t = line.trim();

  if (context.inCode) return "preserve";
  if (context.inFrontmatter) {
    // Only translate title and description values
    if (/^(title|description):\s*"/.test(t)) return "frontmatter";
    return "preserve";
  }

  if (t === "") return "preserve";
  if (t === "---") return "preserve"; // HR or frontmatter delimiter
  if (t.startsWith("<!--")) return "preserve"; // HTML comment
  // Table separator rows  |---|---|
  if (t.startsWith("|") && /^[\|\-\s:]+$/.test(t)) return "preserve";

  return "translate";
}

/**
 * Parse MDX content into an array of segment objects:
 * { index, type, line, prefix?, text?, suffix? }
 */
function parseMdx(content) {
  const lines = content.split("\n");
  const segments = [];

  const ctx = { inFrontmatter: false, inCode: false, frontmatterDone: false };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    // ── Frontmatter open/close ──
    if (i === 0 && t === "---") {
      ctx.inFrontmatter = true;
      segments.push({ index: i, type: "preserve", line });
      continue;
    }
    if (ctx.inFrontmatter && t === "---") {
      ctx.inFrontmatter = false;
      ctx.frontmatterDone = true;
      segments.push({ index: i, type: "preserve", line });
      continue;
    }

    // ── Code block toggle ──
    if (!ctx.inFrontmatter && t.startsWith("```")) {
      ctx.inCode = !ctx.inCode;
      segments.push({ index: i, type: "preserve", line });
      continue;
    }

    const type = classifyLine(line, ctx);

    if (type === "frontmatter") {
      // Extract the quoted value: title: "Some Value"
      const m = line.match(/^(\s*(?:title|description):\s*")(.*?)(")\s*$/);
      if (m) {
        segments.push({
          index: i,
          type: "frontmatter",
          line,
          prefix: m[1],
          text: m[2],
          suffix: m[3],
        });
        continue;
      }
    }

    segments.push({ index: i, type, line });
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Line-level translation (MDX-aware)
// ---------------------------------------------------------------------------

/** Translate title="" and description="" prop values inside JSX tags */
async function translateJsxProps(line, targetLang) {
  const propRe = /\b(title|description)="([^"]+)"/g;
  let result = line;
  let m;
  const tasks = [];

  const regex = new RegExp(propRe.source, propRe.flags);
  while ((m = regex.exec(line)) !== null) {
    tasks.push({ prop: m[1], original: m[2], full: m[0] });
  }

  for (const { prop, original, full } of tasks) {
    const translated = await translateText(original, targetLang);
    if (translated !== original) {
      result = result.replace(full, `${prop}="${translated}"`);
    }
  }

  return result;
}

/** Translate cells of a Markdown table row, preserving pipes and padding */
async function translateTableRow(line, targetLang) {
  const cells = line.split("|");
  const out = [];

  for (const cell of cells) {
    const content = cell.trim();
    if (!content || /^[\-\s:]+$/.test(content)) {
      out.push(cell);
      continue;
    }
    const translated = await translateText(content, targetLang);
    // Preserve surrounding whitespace
    const lead = cell.match(/^\s*/)[0];
    const trail = cell.match(/\s*$/)[0];
    out.push(lead + translated + trail);
  }

  return out.join("|");
}

/**
 * Translate a single MDX body line, preserving all structural elements.
 */
async function translateMdxLine(line, targetLang) {
  const t = line.trim();

  if (!t) return line;

  // Heading: translate text portion only
  const headingM = line.match(/^(#{1,6}\s+)(.+)$/);
  if (headingM) {
    const translated = await translateText(headingM[2], targetLang);
    return headingM[1] + translated;
  }

  // JSX tags — preserve structure, translate title/description props
  if (
    t.startsWith("<") &&
    (t.endsWith(">") || t.endsWith("/>") || t.endsWith(">") || /^<\//.test(t))
  ) {
    return translateJsxProps(line, targetLang);
  }

  // Table row
  if (t.startsWith("|") && t.endsWith("|")) {
    return translateTableRow(line, targetLang);
  }

  // Everything else: plain text, list items, paragraphs
  return translateText(line, targetLang);
}

// ---------------------------------------------------------------------------
// File translation
// ---------------------------------------------------------------------------

async function translateMdxFile(enPath, targetPath, targetLang) {
  const enContent = await fs.readFile(enPath, "utf8");

  // Load existing target file for incremental mode
  let existingLines = null;
  if (!FORCE && (await fs.pathExists(targetPath))) {
    const existing = await fs.readFile(targetPath, "utf8");
    existingLines = existing.split("\n");
  }

  const segments = parseMdx(enContent);
  const result = [];
  let translated = 0;
  let kept = 0;

  for (const seg of segments) {
    // ── Incremental: keep existing translation if it differs from EN ──
    if (existingLines && existingLines[seg.index] !== undefined) {
      const exLine = existingLines[seg.index];
      if (exLine !== seg.line) {
        result.push(exLine);
        kept++;
        continue;
      }
    }

    if (seg.type === "preserve") {
      result.push(seg.line);
      continue;
    }

    if (seg.type === "frontmatter") {
      if (seg.text) {
        const tx = await translateText(seg.text, targetLang);
        result.push(seg.prefix + tx + seg.suffix);
        if (tx !== seg.text) translated++;
      } else {
        result.push(seg.line);
      }
      continue;
    }

    // type === 'translate'
    const tx = await translateMdxLine(seg.line, targetLang);
    result.push(tx);
    if (tx !== seg.line) translated++;
  }

  return { content: result.join("\n"), translated, kept };
}

// ---------------------------------------------------------------------------
// docs.json sync
// ---------------------------------------------------------------------------

/**
 * Mirror EN navigation groups to the target language.
 * - Replaces page paths (en/ → targetLang/)
 * - Translates group names using GROUP_NAME_TRANSLATIONS first,
 *   falls back to Google Translate for unknown group names.
 */
async function syncDocsJson(targetLang) {
  const docsJson = await fs.readJson(DOCS_JSON_PATH);
  const languages = docsJson.navigation?.languages;
  if (!languages) return;

  const enLang = languages.find((l) => l.language === "en");
  if (!enLang) {
    console.error("  No EN language block found in docs.json");
    return;
  }

  const knownTranslations = GROUP_NAME_TRANSLATIONS[targetLang] || {};

  // Build translated groups from EN
  const translatedGroups = [];
  for (const group of enLang.groups) {
    // Translate group name
    let groupName =
      knownTranslations[group.group] ||
      (await translateText(group.group, targetLang));

    // Mirror page paths: en/ → targetLang/
    const pages = group.pages.map((p) =>
      p.startsWith("en/") ? targetLang + "/" + p.slice(3) : p
    );

    translatedGroups.push({ group: groupName, pages });
  }

  // Find or create target language block
  let targetLangBlock = languages.find((l) => l.language === targetLang);
  if (!targetLangBlock) {
    // Add new language block after EN
    targetLangBlock = { language: targetLang, name: targetLang.toUpperCase(), groups: [] };
    languages.push(targetLangBlock);
    console.log(`  Created new language block: ${targetLang}`);
  }

  // Replace groups entirely (mirrors EN structure)
  const existingGroupMap = new Map(
    (targetLangBlock.groups || []).map((g) => [g.group, g])
  );

  targetLangBlock.groups = translatedGroups.map((newGroup) => {
    // Preserve existing group if name matches (to avoid overwriting manual edits)
    const existing = existingGroupMap.get(newGroup.group);
    if (existing) {
      // Update pages to match EN (new pages from EN will be added)
      return { ...existing, pages: newGroup.pages };
    }
    return newGroup;
  });

  await fs.writeJson(DOCS_JSON_PATH, docsJson, { spaces: 2 });
  console.log(`  docs.json synced for [${targetLang}]: ${translatedGroups.length} groups`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function getAllEnFiles() {
  const files = [];
  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith(".mdx")) files.push(full);
    }
  };
  await walk(EN_DIR);
  return files;
}

async function run() {
  console.log(`\nGridix Docs Translator`);
  console.log(`  Source  : en/`);
  console.log(`  Target  : ${TARGET_LANG}/`);
  console.log(`  Mode    : ${FORCE ? "force (retranslate all)" : "incremental"}`);
  if (ONLY_PATTERN) console.log(`  Filter  : *${ONLY_PATTERN}*`);
  console.log();

  const enFiles = await getAllEnFiles();

  // Filter if --only flag provided
  const filesToProcess = ONLY_PATTERN
    ? enFiles.filter((f) => f.includes(ONLY_PATTERN))
    : enFiles;

  console.log(`Found ${filesToProcess.length} files to process\n`);

  let totalTranslated = 0;
  let totalKept = 0;
  let filesUpdated = 0;

  for (const enPath of filesToProcess) {
    const relative = path.relative(EN_DIR, enPath); // e.g. "intro.mdx" or "admin-panel/overview.mdx"
    const targetPath = path.join(TARGET_DIR, relative);

    const isNew = !(await fs.pathExists(targetPath));
    process.stdout.write(`  ${relative} ${isNew ? "[new]" : "[update]"} … `);

    const { content, translated, kept } = await translateMdxFile(
      enPath,
      targetPath,
      TARGET_LANG
    );

    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content, "utf8");

    totalTranslated += translated;
    totalKept += kept;
    if (translated > 0 || isNew) filesUpdated++;

    console.log(`${translated} translated, ${kept} kept`);
  }

  // Sync docs.json navigation
  console.log(`\nSyncing docs.json navigation for [${TARGET_LANG}]…`);
  await syncDocsJson(TARGET_LANG);

  console.log(`\n── Done ──────────────────────────────────────`);
  console.log(`  Files processed   : ${filesToProcess.length}`);
  console.log(`  Files updated     : ${filesUpdated}`);
  console.log(`  Lines translated  : ${totalTranslated}`);
  console.log(`  Lines kept (existing): ${totalKept}`);
}

run().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
