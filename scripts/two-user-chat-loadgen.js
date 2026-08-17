/*
 * Two-user PhoneHQ chat load generator
 * ------------------------------------
 * Odpala 2 osobne okna Chromium (persystentne profile → login raz),
 * czeka aż zalogujesz się manualnie i otworzysz właściwe rozmowy,
 * następnie równolegle strzela sendLoop w obu oknach.
 *
 * Uruchomienie:
 *   node scripts/two-user-chat-loadgen.js
 *
 * Opcje przez zmienne środowiskowe:
 *   COUNT=30          liczba wiadomości na stronę (default 30)
 *   IMAGE_EVERY=5     obrazek co N (default 5, 0 = nigdy)
 *   FILE_EVERY=10     PDF co N (default 10)
 *   VIDEO_EVERY=15    video co N (default 15)
 *   DELAY_MS=200      pauza między wiadomościami (default 200)
 *   PREFIX_1=U1       prefix dla okna 1 (default U1)
 *   PREFIX_2=U2       prefix dla okna 2 (default U2)
 *   URL=https://...   URL czatu (default https://my.phq-preprod.click/chat)
 */

const { chromium } = require('@playwright/test');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const CHAT_URL = process.env.URL || 'https://my.phq-preprod.click/chat';
const LOAD_SCRIPT = fs.readFileSync(path.join(__dirname, 'chat-loadgen.js'), 'utf8');
const PROFILES_DIR = path.resolve(__dirname, '..', '.playwright-profiles');

const OPTS = {
  count: parseInt(process.env.COUNT || '30', 10),
  imageEvery: parseInt(process.env.IMAGE_EVERY || '5', 10),
  fileEvery: parseInt(process.env.FILE_EVERY || '10', 10),
  videoEvery: parseInt(process.env.VIDEO_EVERY || '15', 10),
  delayMs: parseInt(process.env.DELAY_MS || '200', 10),
};
const PREFIX_1 = process.env.PREFIX_1 || 'U1';
const PREFIX_2 = process.env.PREFIX_2 || 'U2';

function ask(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(prompt, ans => { rl.close(); res(ans); }));
}

async function launchWindow(profileName, position) {
  const ctx = await chromium.launchPersistentContext(
    path.join(PROFILES_DIR, profileName),
    {
      headless: false,
      viewport: { width: 1280, height: 900 },
      args: [`--window-position=${position.x},${position.y}`, '--window-size=1280,900'],
    },
  );
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(CHAT_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  return { ctx, page };
}

async function main() {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });

  console.log('Launching 2 Chromium windows with persistent profiles...');
  const [w1, w2] = await Promise.all([
    launchWindow('user1', { x: 0, y: 0 }),
    launchWindow('user2', { x: 1300, y: 0 }),
  ]);

  console.log('\n=== Manual step ===');
  console.log(`Window 1 (${PREFIX_1}): zaloguj się jako user1, otwórz rozmowę z user2`);
  console.log(`Window 2 (${PREFIX_2}): zaloguj się jako user2, otwórz rozmowę z user1`);
  console.log('(profile są persystentne — kolejne odpalenia nie wymagają ponownego logowania)');
  await ask('\nGdy oba okna są gotowe, naciśnij ENTER aby wystartować sendLoop... ');

  console.log('Wstrzykuję chat-loadgen.js do obu okien...');
  await Promise.all([
    w1.page.addScriptTag({ content: LOAD_SCRIPT }),
    w2.page.addScriptTag({ content: LOAD_SCRIPT }),
  ]);

  let round = 0;
  let startIndex = 1;
  while (true) {
    round++;
    console.log(`\n=== Runda ${round} === Start równoległego sendLoop: ${OPTS.count} wiadomości / stronę`);
    console.log(`  img/${OPTS.imageEvery}, file/${OPTS.fileEvery}, video/${OPTS.videoEvery}, delay ${OPTS.delayMs}ms, startIndex=${startIndex}`);
    const t0 = Date.now();
    const [r1, r2] = await Promise.all([
      w1.page.evaluate((o) => window.chatLoad.sendLoop(o), { ...OPTS, prefix: PREFIX_1, startIndex }),
      w2.page.evaluate((o) => window.chatLoad.sendLoop(o), { ...OPTS, prefix: PREFIX_2, startIndex }),
    ]);
    const durationSec = ((Date.now() - t0) / 1000).toFixed(1);

    const summarize = (label, r) =>
      `  ${label}: sent=${r.sent}/${OPTS.count} failed=${r.failed} (img=${r.images} file=${r.files} vid=${r.videos})`;
    console.log(`Done in ${durationSec}s:`);
    console.log(summarize(PREFIX_1, r1));
    console.log(summarize(PREFIX_2, r2));
    startIndex += OPTS.count;

    const ans = (await ask('\nKolejna runda? [ENTER = tak, q+ENTER = wyjście] ')).trim().toLowerCase();
    if (ans === 'q' || ans === 'quit' || ans === 'n' || ans === 'no') break;
  }

  console.log('\nZamykam oba okna...');
  await Promise.all([w1.ctx.close(), w2.ctx.close()]);
}

main().catch(err => {
  console.error('\nBłąd:', err);
  process.exit(1);
});
