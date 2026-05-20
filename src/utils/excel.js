// ─────────────────────────────────────────────
//  src/utils/excel.js
//  Import and export helpers
// ─────────────────────────────────────────────
//  parseImportFile  → uses window.XLSX  (xlsx-js-style CDN)
//  exportStatusFile → uses window.ExcelJS (ExcelJS CDN)
//
//  The two libraries use different globals so they coexist without conflict:
//    XLSX     — SheetJS-based, handles .read() for import
//    ExcelJS  — handles full styling + image embedding for export
//
//  LOGO IMAGE
//  ExcelJS CAN embed raster images.  The logo must be served from the same
//  origin as the app (browser security prevents arbitrary disk reads).
//  Copy the logo to:
//    <worktree>/assets/CARLOGO.png
//  i.e.  D:\forminggit\forming-monitor\.worktrees\
//          forming-monitor-enterprise-sidebar\assets\CARLOGO.png
//  If the file is absent the export still works — it falls back to styled
//  "[ CAR ]" text in the navy header band.
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  parseImportFile
//  Reads MC Daily (.xlsx).
//  Expected columns: [0] Status  [1] MC No.  [2] Part No.
// ─────────────────────────────────────────────
function parseImportFile(arrayBuffer, currentStatuses, currentPartNos) {
  const wb   = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const newSt = { ...currentStatuses };
  const newPn = { ...currentPartNos  };
  let   upd   = 0;

  rows.slice(1).forEach(row => {
    if (!row || row.length < 2) return;
    const stStr = String(row[0] || '').trim();
    const mcId  = String(row[1] || '').trim().toUpperCase();
    const pn    = row[2] != null ? String(row[2]).trim() : '';
    if (!mcId) return;
    const stKey = IMPORT_STATUS_MAP[stStr.toLowerCase()];
    if (stKey) { newSt[mcId] = stKey; if (pn) newPn[mcId] = pn; upd++; }
  });

  return { newStatuses: newSt, newPartNos: newPn, updatedCount: upd };
}

// ─────────────────────────────────────────────
//  exportStatusFile  (async — ExcelJS)
//  Generates M_C Status Data.xlsx with:
//    · CAR logo image (if assets/CARLOGO.png is served) or "[ CAR ]" fallback
//    · Navy/blue company header band
//    · Blue report title row
//    · Dark navy date/plant info row
//    · Cyan accent divider
//    · Blue table column headers (bold white)
//    · Alternating pale-blue / white data rows with borders
//    · Bold summary row (first machine row carries production totals)
//    · Footer row
//    · Frozen header (first 5 rows)
// ─────────────────────────────────────────────

// ExcelJS uses ARGB 8-char colors ('AARRGGBB').
const _XC = {
  navy:      'FF0B1F3A',
  navyMid:   'FF1A3252',
  blue:      'FF0078D7',
  blueDark:  'FF1565C0',
  cyan:      'FF00AEEF',
  paleBlue:  'FFEAF6FF',
  sumBlue:   'FFD0E8F7',
  borderBlu: 'FFB8D0E8',
  borderHdr: 'FF0B1F3A',
  footerBg:  'FFEBF2FA',
  white:     'FFFFFFFF',
  gold:      'FFC8A96B',
  inkLight:  'FFBDD7EE',
  muted:     'FF6B7280',
};

async function exportStatusFile(statuses, partNos, counts, total, plan, actual) {
  // ── Computed values ──────────────────────────────────────────────────────
  const ng   = 0;                       // NG: 0 (no defect count in app state)
  const diff = plan - actual;
  const prod = (actual / plan) * 100;
  const now  = new Date();
  const p    = n => String(n).padStart(2, '0');
  const dateStr = `${p(now.getDate())}/${p(now.getMonth()+1)}/${now.getFullYear()}`;
  const timeStr = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
  const nowStr  = `${dateStr} ${timeStr}`;

  const COL = 24;

  // ── Attempt to load CAR logo from served assets/ folder ──────────────────
  // Browser security blocks arbitrary disk reads — the file must be in the
  // served directory.  If absent, the export silently falls back to text.
  let logoBase64 = null;
  try {
    const resp = await fetch('assets/CARLOGO.png');
    if (resp.ok) {
      const blob = await resp.blob();
      logoBase64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload  = () => resolve(r.result.split(',')[1]);  // strip data-URL prefix
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    }
  } catch (_) {
    // CDN / network error or file absent — continue without logo
  }

  // ── Style helpers (ExcelJS API) ──────────────────────────────────────────
  function mkFill(argb) {
    return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
  }
  function mkFont(sz, bold, argb, italic) {
    const f = { name: 'Calibri', size: sz };
    if (bold)   f.bold   = true;
    if (italic) f.italic = true;
    if (argb)   f.color  = { argb };
    return f;
  }
  function mkBorder(style, argb) {
    const side = () => ({ style, color: { argb } });
    return { top: side(), bottom: side(), left: side(), right: side() };
  }
  function mkAlign(h, v, wrap) {
    const a = { horizontal: h || 'left', vertical: v || 'middle' };
    if (wrap) a.wrapText = true;
    return a;
  }
  function applyStyle(cell, s) {
    if (s.fill)      cell.fill      = s.fill;
    if (s.font)      cell.font      = s.font;
    if (s.alignment) cell.alignment = s.alignment;
    if (s.border)    cell.border    = s.border;
  }
  function styleRow(ws, excelRow, s, c1, c2) {
    for (let c = (c1 || 1); c <= (c2 || COL); c++) {
      applyStyle(ws.getCell(excelRow, c), s);
    }
  }

  // ── Build data rows ───────────────────────────────────────────────────────
  const tableHeaders = [
    'No.','M/C No.','M/C Type','M/C Group','M/C Description',
    'MC Status','Remark','Date/Time','Part No.',
    'Plan (Pcs)','Actual (Pcs)','NG (Pcs)','Diff (Pcs)','Productivity',
    'Running','Machine Down','Mold Setup','Mold Damage',
    'Quality Problem','NO Manpower','NO Material','NO Plan',
    'Total Machine','Man Power',
  ];

  const dataRows = EXPORT_ORDER.map((id, idx) => {
    const meta   = MC_META[id] || { type:'', group:'', desc:'' };
    const stKey  = statuses[id] || 'plan';
    const stName = STATUS_EXPORT_NAME[stKey] || stKey;
    const pn     = partNos[id] || '';

    if (idx === 0) {
      return [
        idx+1, id, meta.type, meta.group, meta.desc, stName, '', nowStr, pn,
        plan, actual, ng, diff, `${prod.toFixed(2)}%`,
        counts.running||0, counts.down||0, counts.setup||0, counts.damage||0,
        counts.qa||0, counts.manpower||0, counts.material||0, counts.plan||0,
        total, 21,
      ];
    }
    return [
      idx+1, id, meta.type, meta.group, meta.desc, stName, '', '', pn,
      '','','','','','','','','','','','','','','',
    ];
  });

  // Excel row indices (1-based)
  const R_LOGO    = 1;
  const R_TITLE   = 2;
  const R_DATE    = 3;
  const R_DIVIDER = 4;
  const R_HEADER  = 5;
  const R_DATA    = 6;
  const R_FOOTER  = R_DATA + dataRows.length;

  // ── Create workbook & worksheet ──────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Forming Monitor Operations Dashboard';
  wb.created = now;

  const ws = wb.addWorksheet('MC_status');

  // Column widths
  ws.columns = [
    {width:5},{width:8},{width:8},{width:14},{width:36},
    {width:16},{width:12},{width:22},{width:20},
    {width:12},{width:12},{width:8},{width:12},{width:14},
    {width:8},{width:14},{width:12},{width:12},
    {width:16},{width:14},{width:12},{width:8},{width:14},{width:12},
  ];

  // ── Merge cells (must be set before styling/values in ExcelJS) ───────────
  ws.mergeCells(R_LOGO,    1,   R_LOGO,    4);    // A1:D1   logo
  ws.mergeCells(R_LOGO,    5,   R_LOGO,    COL);  // E1:X1   company name
  ws.mergeCells(R_TITLE,   1,   R_TITLE,   COL);  // A2:X2   title
  ws.mergeCells(R_DATE,    1,   R_DATE,    COL);  // A3:X3   date/info
  ws.mergeCells(R_DIVIDER, 1,   R_DIVIDER, COL);  // A4:X4   cyan divider
  ws.mergeCells(R_FOOTER,  1,   R_FOOTER,  COL);  // footer

  // ── Row heights ──────────────────────────────────────────────────────────
  ws.getRow(R_LOGO).height    = 56;   // height of logo header band
  ws.getRow(R_TITLE).height   = 32;
  ws.getRow(R_DATE).height    = 18;
  ws.getRow(R_DIVIDER).height = 5;
  ws.getRow(R_HEADER).height  = 30;

  // ── Cell values ──────────────────────────────────────────────────────────
  // Row 1: company header
  ws.getCell(R_LOGO, 1).value = logoBase64 ? '' : '[ CAR ]';
  ws.getCell(R_LOGO, 5).value = 'COMPLETE AUTO RUBBER MANUFACTURING CO.,LTD.';

  // Row 2: title
  ws.getCell(R_TITLE, 1).value = 'M/C STATUS DATA';

  // Row 3: date/plant
  ws.getCell(R_DATE, 1).value =
    `Date: ${dateStr}    Export Time: ${timeStr}    Plant: Plant 04    Department: FORMING`;

  // Row 5: column headers
  tableHeaders.forEach((h, i) => { ws.getCell(R_HEADER, i + 1).value = h; });

  // Rows 6+: machine data
  dataRows.forEach((row, idx) => {
    row.forEach((v, c) => { ws.getCell(R_DATA + idx, c + 1).value = v; });
  });

  // Footer
  ws.getCell(R_FOOTER, 1).value =
    `Generated from Forming Monitor Operations Dashboard  ·  ${nowStr}`;

  // ── Apply styles ─────────────────────────────────────────────────────────

  // Row 1: navy — logo area (cols 1-4)
  styleRow(ws, R_LOGO, {
    fill:      mkFill(_XC.navy),
    font:      mkFont(14, true, _XC.gold),
    alignment: mkAlign('center'),
  }, 1, 4);
  // Row 1: navy — company name (cols 5-24)
  styleRow(ws, R_LOGO, {
    fill:      mkFill(_XC.navy),
    font:      mkFont(11, true, _XC.white),
    alignment: mkAlign('left', 'middle'),
  }, 5, COL);

  // Row 2: blue title band
  styleRow(ws, R_TITLE, {
    fill:      mkFill(_XC.blue),
    font:      mkFont(14, true, _XC.white),
    alignment: mkAlign('center'),
  });

  // Row 3: dark navy date/info
  styleRow(ws, R_DATE, {
    fill:      mkFill(_XC.navyMid),
    font:      mkFont(9, false, _XC.inkLight),
    alignment: mkAlign('left'),
  });

  // Row 4: cyan accent divider
  styleRow(ws, R_DIVIDER, { fill: mkFill(_XC.cyan) });

  // Row 5: table column headers
  styleRow(ws, R_HEADER, {
    fill:      mkFill(_XC.blueDark),
    font:      mkFont(10, true, _XC.white),
    alignment: mkAlign('center', 'middle', true),
    border:    mkBorder('medium', _XC.borderHdr),
  });

  // Data rows: alternating fills, full borders, numeric columns right-aligned
  // Numeric columns are 1-indexed positions 10-24 (Plan through Man Power)
  const numCols  = new Set([10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]);
  const thinBdr  = mkBorder('thin', _XC.borderBlu);

  for (let idx = 0; idx < dataRows.length; idx++) {
    const r          = R_DATA + idx;
    const isSummary  = idx === 0;
    const isEven     = idx % 2 === 0;
    const bgArgb     = isSummary ? _XC.sumBlue : (isEven ? _XC.paleBlue : _XC.white);

    for (let c = 1; c <= COL; c++) {
      applyStyle(ws.getCell(r, c), {
        fill:      mkFill(bgArgb),
        font:      mkFont(10, isSummary),
        alignment: mkAlign(numCols.has(c) ? 'right' : c === 1 ? 'center' : 'left'),
        border:    thinBdr,
      });
    }
  }

  // Footer row
  styleRow(ws, R_FOOTER, {
    fill:      mkFill(_XC.footerBg),
    font:      mkFont(9, false, _XC.muted, true),
    alignment: mkAlign('left'),
  });

  // ── Freeze first 5 rows ──────────────────────────────────────────────────
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: R_HEADER }];

  // ── Embed CAR logo image (if loaded) ─────────────────────────────────────
  if (logoBase64) {
    // ── Logo placement constants — adjust here to re-tune ──────────────────
    // Logo block: A1:D1, merged across cols A(5wch) B(8wch) C(8wch) D(14wch)
    // Col widths in pixels (≈7px per wch): A=35, B=56, C=56, D=98 → total 245px
    // Row height: 56px.  Logo: 120×40px (3:1 native ratio of CARLOGO.png).
    //
    // Horizontal centre:  left margin = (245-120)/2 = 62.5px
    //   62.5px > col A (35px) → into col B: (62.5-35)/56 ≈ 0.49 → col = 1+0.49 = 1.49
    // Vertical centre:    top margin  = (56-40)/2  = 8px  → row = 8/56 ≈ 0.14
    const LOGO_TL   = { col: 1.49, row: 0.30 };
    const LOGO_SIZE = { width: 120, height: 40 };

    const imageId = wb.addImage({ base64: logoBase64, extension: 'png' });
    ws.addImage(imageId, {
      tl: LOGO_TL,
      ext: LOGO_SIZE,
      editAs: 'oneCell',
    });
  }

  // ── Write and trigger browser download ───────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob(
    [buffer],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = 'M_C Status Data.xlsx';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
}
