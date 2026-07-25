/*
 * PhoneHQ chat load generator
 * ---------------------------
 * Wklej w DevTools console (Cmd+Opt+J / F12) na stronie /chat, potem wywołaj:
 *
 *   await chatLoad.sendLoop({ count: 50, imageEvery: 5, fileEvery: 10, videoEvery: 15, prefix: 'NG' })
 *
 * Parametry sendLoop:
 *   count        — ile wiadomości wysłać (wymagane)
 *   imageEvery   — co która iteracja doda obrazek (0 = nigdy)
 *   fileEvery    — co która iteracja doda plik (np. PDF) — nadpisuje obrazek
 *   videoEvery   — co która iteracja doda video — nadpisuje obrazek i plik
 *   prefix       — etykieta wiadomości, np. 'NG' -> 'NG-01: ...' (default 'MSG')
 *   startIndex   — od jakiego numeru zaczyna liczyć (default 1)
 *   delayMs      — pauza po każdej wiadomości (default 200)
 *   words        — tablica słów do randomowej treści (default WORDS_DEFAULT)
 *   imageSource  — 'picsum' (default, real random photos) | 'noise' (locally generated canvas noise)
 *   imageOptions — { width, height, quality } dla trybu 'noise' (default 1600x1200, q=0.85)
 *   videoUrl     — konkretny URL zamiast rotacji po VIDEO_POOL
 *   fileUrl      — konkretny URL zamiast rotacji po FILE_POOL
 *
 * Precedencja (gdy iteracja pasuje do wielu): video > file > image.
 *
 * Zwraca podsumowanie: { sent, failed, images, files, videos, first, last, results }.
 *
 * Dwie sesje równolegle (test live send/receive):
 *   Otwórz drugie okno przeglądarki (osobny profil / incognito), zaloguj się drugim
 *   userem, wklej ten sam skrypt, uruchom z innym prefixem.
 */

(() => {
  const WORDS_DEFAULT = [
    'brave','swift','quiet','purple','stone','river','cloud','moon','forest','ember',
    'silver','harbor','breeze','copper','ocean','mountain','shadow','whisper','ancient','crystal',
    'thunder','marble','velvet','golden','crimson','emerald','frozen','distant','hollow','gentle',
    'fierce','wooden','glass','iron','flame','coral','pearl','stellar','nimble','clever',
    'bright','silent','rapid','tender','vivid','plain','sharp','soft','warm','cold',
  ];

  // Realne sample MP4 (H.264 + audio) z CORS-friendly CDN.
  const VIDEO_POOL = [
    { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4', label: 'friday-503kb' },
    { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', label: 'flower-1.1mb' },
    { url: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4', label: 'bbb-5.4mb' },
  ];

  // Realne sample plików (PDF) z CORS-friendly CDN.
  const FILE_POOL = [
    { url: 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf', label: 'tracemonkey-992kb', mime: 'application/pdf', ext: 'pdf' },
    { url: 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/examples/learning/helloworld.pdf', label: 'helloworld-1kb', mime: 'application/pdf', ext: 'pdf' },
  ];

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const composerInput = () => document.querySelector('#mention-text-input');
  const imageInput = () => document.querySelector('input[type="file"][accept="image/*"]');
  const videoInput = () => document.querySelector('input[type="file"][accept="video/*"]');
  const fileInputAny = () => document.querySelectorAll('input[type="file"][accept="*/*"]')[0];
  const sendButton = () => document.querySelector('button:has(svg.lucide-send-horizontal)');

  function randomText(words, min = 3, max = 5) {
    const n = min + Math.floor(Math.random() * (max - min + 1));
    return Array.from({ length: n }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  }

  async function setComposerText(text) {
    const input = composerInput();
    if (!input) throw new Error('composer #mention-text-input not found');
    input.focus();
    input.textContent = '';
    input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: text, bubbles: true, cancelable: true }));
    input.textContent = text;
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text, bubbles: true }));
  }

  async function attachToInput(input, file) {
    if (!input) throw new Error('file input not found');
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function waitForSendEnabled(timeoutMs = 1200) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const btn = sendButton();
      if (btn && !btn.disabled) return btn;
      await sleep(30);
    }
    return null;
  }

  function generateNoiseImage({ width = 1600, height = 1200, quality = 0.85 } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.random() * 255;
      d[i + 1] = Math.random() * 255;
      d[i + 2] = Math.random() * 255;
      d[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  async function fetchPicsumImage({ width = 1600, height = 1200 } = {}) {
    const url = `https://picsum.photos/${width}/${height}?random=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`picsum ${url} failed: HTTP ${r.status}`);
    return r.blob();
  }

  const videoCache = new Map();
  async function fetchVideo(url) {
    if (videoCache.has(url)) return videoCache.get(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch ${url} failed: HTTP ${r.status}`);
    const blob = await r.blob();
    videoCache.set(url, blob);
    return blob;
  }

  const fileCache = new Map();
  async function fetchFile(url) {
    if (fileCache.has(url)) return fileCache.get(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch ${url} failed: HTTP ${r.status}`);
    const blob = await r.blob();
    fileCache.set(url, blob);
    return blob;
  }

  async function sendText({ prefix, index, words }) {
    const msg = `${prefix}-${String(index).padStart(2, '0')}: ${randomText(words)}`;
    await setComposerText(msg);
    const btn = await waitForSendEnabled();
    if (!btn) throw new Error('send button never enabled');
    btn.click();
    return { msg, kind: 'text' };
  }

  async function sendTextWithImage({ prefix, index, words, imageSource = 'picsum', imageOptions }) {
    const blob = imageSource === 'noise'
      ? await generateNoiseImage(imageOptions)
      : await fetchPicsumImage(imageOptions);
    const source = imageSource === 'noise' ? 'noise' : 'picsum';
    const msg = `${prefix}-${String(index).padStart(2, '0')}-IMG(${source}): ${randomText(words)}`;
    const file = new File([blob], `${prefix}-${index}-${source}-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await attachToInput(imageInput(), file);
    await sleep(600);
    await setComposerText(msg);
    const btn = await waitForSendEnabled();
    if (!btn) throw new Error('send button never enabled (image)');
    btn.click();
    return { msg, kind: 'image', source, sizeKB: Math.round(blob.size / 1024) };
  }

  async function sendTextWithFile({ prefix, index, words, fileUrl }) {
    const entry = fileUrl
      ? { url: fileUrl, label: 'custom', mime: 'application/octet-stream', ext: 'bin' }
      : FILE_POOL[index % FILE_POOL.length];
    const blob = await fetchFile(entry.url);
    const mime = entry.mime || blob.type || 'application/octet-stream';
    const msg = `${prefix}-${String(index).padStart(2, '0')}-FILE(${entry.label}): ${randomText(words)}`;
    const file = new File([blob], `${prefix}-${index}-${entry.label}-${Date.now()}.${entry.ext}`, { type: mime });
    await attachToInput(fileInputAny(), file);
    await sleep(800);
    await setComposerText(msg);
    const btn = await waitForSendEnabled(2000);
    if (!btn) throw new Error('send button never enabled (file)');
    btn.click();
    return { msg, kind: 'file', label: entry.label, sizeKB: Math.round(blob.size / 1024) };
  }

  async function sendTextWithVideo({ prefix, index, words, videoUrl }) {
    const url = videoUrl || VIDEO_POOL[index % VIDEO_POOL.length].url;
    const label = VIDEO_POOL.find(v => v.url === url)?.label || 'custom';
    const blob = await fetchVideo(url);
    const msg = `${prefix}-${String(index).padStart(2, '0')}-VID(${label}): ${randomText(words)}`;
    const file = new File([blob], `${prefix}-${index}-${label}-${Date.now()}.mp4`, { type: blob.type || 'video/mp4' });
    await attachToInput(videoInput(), file);
    await sleep(1000);
    await setComposerText(msg);
    const btn = await waitForSendEnabled(2000);
    if (!btn) throw new Error('send button never enabled (video)');
    btn.click();
    return { msg, kind: 'video', sizeKB: Math.round(blob.size / 1024), label };
  }

  async function sendLoop({
    count,
    imageEvery = 0,
    fileEvery = 0,
    videoEvery = 0,
    prefix = 'MSG',
    startIndex = 1,
    delayMs = 200,
    words = WORDS_DEFAULT,
    imageSource = 'picsum',
    imageOptions,
    videoUrl,
    fileUrl,
  } = {}) {
    if (!count || count < 1) throw new Error('sendLoop: count required (>=1)');
    const results = [];
    let sent = 0, failed = 0, images = 0, files = 0, videos = 0;
    for (let i = 0; i < count; i++) {
      const iter = i + 1;
      const index = startIndex + i;
      const isVideo = videoEvery > 0 && iter % videoEvery === 0;
      const isFile = !isVideo && fileEvery > 0 && iter % fileEvery === 0;
      const isImage = !isVideo && !isFile && imageEvery > 0 && iter % imageEvery === 0;
      try {
        let r;
        if (isVideo) { r = await sendTextWithVideo({ prefix, index, words, videoUrl }); videos++; }
        else if (isFile) { r = await sendTextWithFile({ prefix, index, words, fileUrl }); files++; }
        else if (isImage) { r = await sendTextWithImage({ prefix, index, words, imageSource, imageOptions }); images++; }
        else { r = await sendText({ prefix, index, words }); }
        results.push(r);
        sent++;
      } catch (e) {
        failed++;
        results.push({ error: String(e), iter, index });
      }
      await sleep(delayMs);
    }
    return {
      sent, failed, images, files, videos,
      first: results[0],
      last: results[results.length - 1],
      results,
    };
  }

  window.chatLoad = {
    sendLoop,
    sendText,
    sendTextWithImage,
    sendTextWithFile,
    sendTextWithVideo,
    generateNoiseImage,
    fetchPicsumImage,
    fetchVideo,
    fetchFile,
    VIDEO_POOL,
    FILE_POOL,
    WORDS_DEFAULT,
  };
  console.log('%c[chatLoad] ready', 'color:#0a0;font-weight:bold', 'try: await chatLoad.sendLoop({ count: 30, imageEvery: 5, fileEvery: 10, videoEvery: 15, prefix: "NG" })');
})();
