/**
 * Fetches 개역한글 (KRV) from bolls.life and writes per-book JSON under data/bible-text/.
 * Run: npm run bible:fetch
 *
 * Source: https://bolls.life/ (KRV translation). Use only in compliance with their terms / licensing.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const booksPath = path.join(root, "data", "bible-books.json");
const outDir = path.join(root, "data", "bible-text");
const BASE = "https://bolls.life/get-text/KRV";

const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchChapter(bookId, chapter) {
  const url = `${BASE}/${bookId}/${chapter}/`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${url}`);
  }
  return res.json();
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const delayMs = Number(process.env.BIBLE_FETCH_DELAY_MS || "80");

  for (const book of books) {
    const fileName = `${String(book.book_id).padStart(3, "0")}.json`;
    const outPath = path.join(outDir, fileName);
    if (process.env.BIBLE_FETCH_SKIP_EXISTING === "1" && fs.existsSync(outPath)) {
      console.log(`skip ${book.book_name} (exists)`);
      continue;
    }

    const verses = [];
    console.log(`fetch ${book.book_name} (${book.chapter_count} chapters)...`);

    for (let chapter = 1; chapter <= book.chapter_count; chapter++) {
      let rows;
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          rows = await fetchChapter(book.book_id, chapter);
          break;
        } catch (e) {
          if (attempt === 4) throw e;
          await sleep(500 * attempt);
        }
      }
      for (const row of rows) {
        verses.push({
          chapter,
          verse: row.verse,
          text: String(row.text ?? "").trim(),
        });
      }
      if (chapter % 10 === 0 || chapter === book.chapter_count) {
        process.stdout.write(`  ch ${chapter}/${book.chapter_count}\r`);
      }
      await sleep(delayMs);
    }
    console.log(`  done ${book.book_name} — ${verses.length} verses`);

    const payload = {
      book_id: book.book_id,
      book_name: book.book_name,
      verses,
    };
    fs.writeFileSync(outPath, JSON.stringify(payload), "utf8");
  }

  console.log("All books written to data/bible-text/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
