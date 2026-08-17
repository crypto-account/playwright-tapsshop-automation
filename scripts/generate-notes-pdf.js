const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { chromium } = require('@playwright/test');

const NOTES_MD = path.join(__dirname, '..', 'interview-notes.md');
const OUT_PDF = path.join(__dirname, '..', 'interview-notes.pdf');

const md = fs.readFileSync(NOTES_MD, 'utf8');
const htmlBody = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Interview Notes — Junior QA (Playwright + JS)</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
    color: #1a202c;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 40px;
    line-height: 1.55;
    font-size: 11pt;
  }
  h1 {
    font-size: 22pt;
    color: #1a365d;
    border-bottom: 3px solid #3182ce;
    padding-bottom: 8px;
    margin-top: 36px;
    page-break-before: always;
  }
  h1:first-of-type { page-break-before: avoid; }
  h2 {
    font-size: 16pt;
    color: #2c5282;
    margin-top: 24px;
    border-bottom: 1px solid #cbd5e0;
    padding-bottom: 4px;
  }
  h3 {
    font-size: 13pt;
    color: #2b6cb0;
    margin-top: 20px;
    page-break-after: avoid;
  }
  h3:has(+ p), h3 { page-break-after: avoid; }
  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Fira Mono', monospace;
    font-size: 9.5pt;
    background: #edf2f7;
    padding: 1px 5px;
    border-radius: 3px;
    color: #c53030;
  }
  pre {
    background: #1a202c;
    color: #f7fafc;
    padding: 12px 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
    page-break-inside: avoid;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e0;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #edf2f7;
    font-weight: 600;
    color: #2d3748;
  }
  tr:nth-child(even) td { background: #f7fafc; }
  blockquote {
    border-left: 4px solid #3182ce;
    background: #ebf8ff;
    padding: 8px 16px;
    margin: 12px 0;
    color: #2c5282;
    font-style: italic;
  }
  ul, ol { padding-left: 24px; }
  li { margin: 4px 0; }
  a { color: #3182ce; text-decoration: none; }
  a:hover { text-decoration: underline; }
  hr {
    border: none;
    border-top: 1px solid #cbd5e0;
    margin: 24px 0;
  }
  strong { color: #1a365d; }
  @page {
    size: A4;
    margin: 15mm;
  }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
        path: OUT_PDF,
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size:8px;color:#718096;padding:0 15mm;width:100%;text-align:right;">Interview Notes — Junior QA (Playwright + JS)</div>`,
        footerTemplate: `<div style="font-size:8px;color:#718096;padding:0 15mm;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    });
    await browser.close();
    console.log(`PDF generated: ${OUT_PDF}`);
})();
