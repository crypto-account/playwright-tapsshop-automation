const fs = require('fs');
const path = require('path');

const NOTES_PATH = path.join(__dirname, '..', 'interview-notes.md');
const OUT_PATH = NOTES_PATH;

const sections = [
    {
        id: 1,
        title: '§1 — Locatory i selektory',
        intro: 'Sekcja o **wyborze i użyciu locatorów** — najbardziej fundamentalna wiedza w Playwright.\nKluczowe: preferować **user-facing locatory** (role/tekst/label) nad CSS/XPath. Znać pułapkę z accessible name.',
        pys: [1, 9],
    },
    {
        id: 2,
        title: '§2 — Asercje',
        intro: 'Sekcja o **weryfikacji stanu strony** — dwa światy asercji Playwright: web-first (auto-retry) i generyczne.\nKluczowe: `await expect(locator)` z auto-waitem to 95% przypadków; nigdy nie zapomnij `await`.',
        pys: [6],
    },
    {
        id: 3,
        title: '§3 — Wzorce projektowe',
        intro: 'Sekcja o **organizacji kodu testowego** — jak pisać testy które da się utrzymywać przy zmianach UI.\nKluczowe: Page Object Pattern jako podstawa; testy opisują *co*, POM opisuje *jak*.',
        pys: [3],
    },
    {
        id: 4,
        title: '§4 — AI-assisted testing (MCP, Skille, Agenty)',
        intro: 'Sekcja o **AI w cyklu testerskim** — jak MCP, skille i agenty Claude Code przyspieszają pisanie i utrzymanie testów Playwright.\nKluczowe: MCP daje narzędzia, skille dają know-how, agenty łączą jedno z drugim + własny prompt. Znać różnicę.',
        pys: [2, 4, 5, 7, 8],
    },
    {
        id: 5,
        title: '§5 — CI/CD strategy',
        intro: 'Sekcja o **kiedy odpalać jakie testy w pipeline** — od pre-commit hook do synthetic monitoring produkcji.\nKluczowe: nie odpalaj wszystkiego wszędzie; dopasuj scope testów do etapu (fail-fast, shift-left, piramida triggerów).',
        pys: [10],
    },
    {
        id: 6,
        title: '§6 — Wybór frameworka (Playwright vs Cypress)',
        intro: 'Sekcja o **kompromisach między frameworkami E2E** — dlaczego Playwright wygrywa dla nowych projektów CI/CD.\nKluczowe: cross-browser natywnie, parallel/shard za darmo, architektura CDP (nie w iframe), 5 języków.',
        pys: [11],
    },
];

const source = fs.readFileSync(NOTES_PATH, 'utf8');

// Split into: preamble (before first ### PY-) and blocks per PY
const headerRegex = /^### PY-(\d+):/gm;
const matches = [...source.matchAll(headerRegex)];
if (matches.length === 0) {
    console.error('No PY blocks found.');
    process.exit(1);
}

const preamble = source.slice(0, matches[0].index);
const blocks = {};
for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : source.length;
    const num = parseInt(matches[i][1], 10);
    blocks[num] = source.slice(start, end).trim();
}

// Preamble: keep everything up to (but not including) the first "# §1 —" heading — we'll rebuild sections
const sectionStartMarker = /^# §1 —/m;
const cleanPreamble = preamble.replace(sectionStartMarker, '<!-- section start removed -->\n# §1 —');
// Actually we want to strip the "# §1 —" we already inserted, and reinsert cleanly below.
const preambleTruncated = preamble.split(/^# §1 —/m)[0].trimEnd() + '\n\n---\n\n';

let out = preambleTruncated;
for (const section of sections) {
    out += `# ${section.title}\n\n${section.intro}\n\n---\n\n`;
    for (const py of section.pys) {
        if (!blocks[py]) {
            console.warn(`Missing PY-${py}`);
            continue;
        }
        out += blocks[py] + '\n\n---\n\n';
    }
}

// Trim trailing separator
out = out.replace(/(\n---\n\n)+$/, '\n');

fs.writeFileSync(OUT_PATH, out, 'utf8');
console.log(`Reorganized notes written to ${OUT_PATH}`);
console.log(`Sections: ${sections.length}, PY blocks: ${Object.keys(blocks).length}`);
