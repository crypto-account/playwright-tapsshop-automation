#!/usr/bin/env python3
"""
Convert a /qa-case run's two TSV files into a styled single-file XLSX.

Usage:
    scripts/qa-tsv-to-xlsx.py <base>
    scripts/qa-tsv-to-xlsx.py qa-runs/wyszukiwarka-instytucji-2026-08-13-run2

Reads:
    <base>-cases.tsv, <base>-report.tsv
    <base>.md         (optional — provides Feature / Priority / Date for the title bar)

Writes:
    <base>.xlsx       (two sheets: "Test cases", "Execution report")
"""

import csv, io, re, sys
from pathlib import Path
from urllib.parse import urlparse
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont

# Title bar (row 1) — darker shade than header row
TITLE_FILL = PatternFill("solid", fgColor="305496")
TITLE_FONT = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
TITLE_ALIGN = Alignment(horizontal="left", vertical="center", indent=1, wrap_text=False)

# Header row (row 2)
HEADER_FILL = PatternFill("solid", fgColor="305496")
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
HEADER_ALIGN = Alignment(horizontal="center", vertical="center", wrap_text=True)

BODY_FONT = Font(name="Calibri", size=10)
BODY_FONT_BOLD = Font(name="Calibri", size=10, bold=True)

# Columns whose body cells should render in bold (emphasises the case name)
BOLD_COLUMNS = {"Tytuł", "Title"}

# Columns whose body cells are parsed for inline rich text:
#   "..." (double-quoted spans)  → bold
#   https?://… full URL          → hyperlink (blue + underline; whole cell links if only one URL)
#   /path?query relative path    → hyperlink expanded against the run's base URL
RICH_TEXT_COLUMNS = {
    "Kroki", "Steps",
    "Reprodukcja", "Repro",
    "Warunki wstępne", "Preconditions",
    "Dane testowe", "Test Data",
    "Oczekiwany rezultat", "Expected Result",
    "Rzeczywisty rezultat", "Actual Result",
}

# Rich-text fonts — InlineFont accepts colours as AARRGGBB
RT_PLAIN = InlineFont(rFont="Calibri", sz=10)
RT_BOLD  = InlineFont(rFont="Calibri", sz=10, b=True)
RT_LINK  = InlineFont(rFont="Calibri", sz=10, u="single", color="FF0563C1")
BODY_ALIGN_TOP = Alignment(horizontal="left", vertical="top", wrap_text=True)
BODY_ALIGN_CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)

ZEBRA_FILL = PatternFill("solid", fgColor="F2F2F2")

THIN = Side(border_style="thin", color="D0D0D0")
BORDER = Border(top=THIN, bottom=THIN, left=THIN, right=THIN)

# Category fills — pastel backgrounds, dark text
PRIORITY_FILL = {
    "P1 · Krytyczny": PatternFill("solid", fgColor="FFCCCC"),
    "P2 · Wysoki":    PatternFill("solid", fgColor="FFF2CC"),
    "P3 · Niski":     PatternFill("solid", fgColor="D9D9D9"),
    # Legacy short codes still recognised
    "P1": PatternFill("solid", fgColor="FFCCCC"),
    "P2": PatternFill("solid", fgColor="FFF2CC"),
    "P3": PatternFill("solid", fgColor="D9D9D9"),
}
TYPE_FILL = {
    "positive": PatternFill("solid", fgColor="C6EFCE"),
    "negative": PatternFill("solid", fgColor="FFC7CE"),
    "edge":     PatternFill("solid", fgColor="BDD7EE"),
}
STATUS_FILL = {
    "PASS":    PatternFill("solid", fgColor="C6EFCE"),
    "FAIL":    PatternFill("solid", fgColor="FFC7CE"),
    "BLOCKED": PatternFill("solid", fgColor="FFF2CC"),
    "NOT RUN": PatternFill("solid", fgColor="E7E6E6"),
}
SEVERITY_FILL = {
    "Critical": PatternFill("solid", fgColor="C00000"),
    "High":     PatternFill("solid", fgColor="F8CBAD"),
    "Medium":   PatternFill("solid", fgColor="FFF2CC"),
    "Low":      PatternFill("solid", fgColor="D9D9D9"),
}
SEVERITY_FONT_WHITE = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
CATEGORY_FONT = Font(name="Calibri", size=10, bold=True)

# Column widths per sheet
CASES_WIDTHS = {
    # Polish (current)
    "ID": 11, "Tytuł": 42, "Priorytet": 14,
    "Warunki wstępne": 32, "Dane testowe": 30, "Kroki": 55, "Oczekiwany rezultat": 42,
    "Wynik": 12, "ID buga": 14, "Notatki": 35,
    # Legacy English still recognised
    "Title": 42, "Priority": 14, "Type": 12,
    "Preconditions": 32, "Test Data": 30, "Steps": 55, "Expected Result": 42,
    "Result": 12, "Bug ID": 14, "Notes": 35,
    "Suite": 20,
}
REPORT_WIDTHS = {
    # Polish (current)
    "ID": 11, "Status": 11, "Rzeczywisty rezultat": 60, "Waga": 12,
    "Zrzut ekranu": 26, "Reprodukcja": 55,
    # Legacy English still recognised
    "Actual Result": 60, "Severity": 12, "Screenshot": 26, "Repro": 55,
}


def load_tsv(path: Path) -> list[list[str]]:
    return list(csv.reader(io.StringIO(path.read_text()), delimiter="\t"))


def load_meta(md_path: Path) -> dict:
    """Extract Feature / Priority / URL from the .md Brief section.
    Falls back to empty strings if missing."""
    meta = {"feature": "", "priority": "", "url": ""}
    if not md_path.exists():
        return meta
    text = md_path.read_text()
    # H1 like: "# QA run — Wyszukiwarka instytucji — 2026-08-13 (run 2)"
    h1 = re.search(r'^#\s+QA run\s+—\s+(.+?)\s+—\s+\d{4}-\d{2}-\d{2}', text, re.M)
    if h1:
        meta["feature"] = h1.group(1).strip()
    # Brief-section fields (authoritative if present)
    m = re.search(r'\*\*Feature:\*\*\s*(.+)', text)
    if m:
        meta["feature"] = m.group(1).strip()
    m = re.search(r'\*\*Priori(?:ty|tet):\*\*\s*(\S+)', text)
    if m:
        meta["priority"] = m.group(1).strip()
    m = re.search(r'\*\*URL:\*\*\s*(\S+)', text)
    if m:
        meta["url"] = m.group(1).strip()
    return meta


def title_text(meta: dict) -> str:
    parts = []
    if meta.get("feature"):
        parts.append(f"Testowana funkcjonalność: {meta['feature']}")
    if meta.get("priority"):
        parts.append(meta["priority"])
    return "  ·  ".join(parts)


def style_sheet(ws, rows: list[list[str]], widths: dict[str, int],
                category_fills: dict[int, dict], meta: dict):
    if not rows:
        return
    headers = rows[0]
    ncols = len(headers)
    origin = origin_of(meta.get("url", ""))

    # Column widths
    for idx, name in enumerate(headers, start=1):
        w = widths.get(name, 18)
        ws.column_dimensions[get_column_letter(idx)].width = w

    # Row 1 — title bar (merged across all columns)
    ws.cell(row=1, column=1, value=title_text(meta))
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ncols)
    title_cell = ws.cell(row=1, column=1)
    title_cell.fill = TITLE_FILL
    title_cell.font = TITLE_FONT
    title_cell.alignment = TITLE_ALIGN
    ws.row_dimensions[1].height = 40

    # Row 2 — column headers
    for col_idx, val in enumerate(headers, start=1):
        c = ws.cell(row=2, column=col_idx, value=val)
        c.fill = HEADER_FILL
        c.font = HEADER_FONT
        c.alignment = HEADER_ALIGN
        c.border = BORDER
    ws.row_dimensions[2].height = 32
    ws.freeze_panes = "A3"

    # Body — start at row 3
    for offset, row in enumerate(rows[1:]):
        r_i = 3 + offset
        zebra = (offset % 2 == 1)  # alternate starting with unshaded first data row
        for c_i, val in enumerate(row, start=1):
            header = headers[c_i - 1]
            cell = ws.cell(row=r_i, column=c_i, value=val)
            cell.border = BORDER
            cell.font = BODY_FONT_BOLD if header in BOLD_COLUMNS else BODY_FONT

            # Category coloring
            colored = False
            for col_index, fill_map in category_fills.items():
                if c_i == col_index and val in fill_map:
                    cell.fill = fill_map[val]
                    cell.font = SEVERITY_FONT_WHITE if val == "Critical" else CATEGORY_FONT
                    cell.alignment = BODY_ALIGN_CENTER
                    colored = True
                    break

            if not colored:
                if zebra:
                    cell.fill = ZEBRA_FILL
                if header == "ID" or (isinstance(val, str) and len(val) <= 3):
                    cell.alignment = BODY_ALIGN_CENTER
                else:
                    cell.alignment = BODY_ALIGN_TOP

                # Rich text: bold for "quoted" spans, link styling for URLs/paths.
                # Applied only to designated long-text columns.
                if header in RICH_TEXT_COLUMNS and isinstance(val, str) and val and val != "-":
                    rt, href = build_rich_text(val, origin)
                    cell.value = rt
                    if href:
                        cell.hyperlink = href


RICH_TOKEN_RE = re.compile(
    r'"([^"]+)"'                                    # (1) "quoted" → bold
    r'|(https?://[^\s"<>)]+)'                       # (2) full URL → link
    r'|(/[a-zA-Z][\w\-/.]*(?:\?[^\s"<>)]+)?)'       # (3) relative path → link (needs base)
)


def build_rich_text(text: str, origin: str | None):
    """Parse text and return (CellRichText, first_href_or_none). If origin is given,
    relative paths starting with '/' are expanded to full URLs for the cell hyperlink."""
    rt = CellRichText()
    first_href = None
    last = 0
    for m in RICH_TOKEN_RE.finditer(text):
        if m.start() > last:
            rt.append(TextBlock(RT_PLAIN, text[last:m.start()]))
        quoted, url, path = m.group(1), m.group(2), m.group(3)
        if quoted is not None:
            # Preserve the quotes visually and bold the whole thing including them
            rt.append(TextBlock(RT_BOLD, f'"{quoted}"'))
        elif url is not None:
            rt.append(TextBlock(RT_LINK, url))
            if first_href is None:
                first_href = url
        elif path is not None:
            rt.append(TextBlock(RT_LINK, path))
            if first_href is None and origin:
                first_href = origin.rstrip("/") + path
        last = m.end()
    if last < len(text):
        rt.append(TextBlock(RT_PLAIN, text[last:]))
    return rt, first_href


def origin_of(url: str) -> str | None:
    if not url:
        return None
    p = urlparse(url)
    if not p.scheme or not p.netloc:
        return None
    return f"{p.scheme}://{p.netloc}"


def category_fills_for(headers: list[str], mapping: dict[str, dict]) -> dict[int, dict]:
    """Resolve header names → 1-based column indices for the fill maps."""
    out = {}
    for name, fill_map in mapping.items():
        if name in headers:
            out[headers.index(name) + 1] = fill_map
    return out


def build(base: Path):
    cases_rows = load_tsv(base.with_name(base.name + "-cases.tsv"))
    report_rows = load_tsv(base.with_name(base.name + "-report.tsv"))
    meta = load_meta(base.with_suffix(".md")) if base.suffix else load_meta(base.with_name(base.name + ".md"))

    wb = Workbook()
    ws1 = wb.active
    ws1.title = "Test cases"
    ws1.sheet_properties.tabColor = "305496"
    style_sheet(
        ws1, cases_rows, CASES_WIDTHS,
        category_fills_for(cases_rows[0], {
            "Priorytet": PRIORITY_FILL, "Priority": PRIORITY_FILL,
            "Wynik": STATUS_FILL, "Result": STATUS_FILL,
        }),
        meta,
    )

    ws2 = wb.create_sheet("Execution report")
    ws2.sheet_properties.tabColor = "305496"
    style_sheet(
        ws2, report_rows, REPORT_WIDTHS,
        category_fills_for(report_rows[0], {
            "Status": STATUS_FILL,
            "Waga": SEVERITY_FILL, "Severity": SEVERITY_FILL,
        }),
        meta,
    )

    out = base.with_suffix(".xlsx") if base.suffix else base.with_name(base.name + ".xlsx")
    wb.save(out)
    print(f"Wrote {out}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    build(Path(sys.argv[1]))
