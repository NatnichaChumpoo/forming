// ─────────────────────────────────────────────
//  src/utils/excel.js
//  Import and export helpers — requires SheetJS (XLSX) loaded globally
// ─────────────────────────────────────────────
//  Depends on: window.XLSX (loaded via CDN in index.html)
//  Depends on: MC_META, EXPORT_ORDER  from ../data/machines.js
//  Depends on: STATUS_EXPORT_NAME, IMPORT_STATUS_MAP  from ../data/statuses.js
// ─────────────────────────────────────────────

function parseImportFile(arrayBuffer, currentStatuses, currentPartNos) {
  const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const newSt  = { ...currentStatuses };
  const newPn  = { ...currentPartNos  };
  let   upd    = 0;

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

function exportStatusFile(statuses, partNos, counts, total, plan, actual) {
  const ng  = 0;
  const diff = plan - actual;
  const now  = new Date();
  const nowStr = now.toLocaleString('en-GB', {
    day:'2-digit',month:'2-digit',year:'numeric',
    hour:'2-digit',minute:'2-digit',second:'2-digit',
  });

  const headers = [
    '','M/C No.','M/C Type','M/C Group','M/C Description',
    'MC Status','Remark','Date/Time','Part No.',
    'Plan (Pcs)','Actual (Pcs)','NG (Pcs)','Diff (Pcs)','Productivity',
    'Running','Machine Down','Mold Setup','Mold Damage',
    'Quality Problem','NO Manpower','NO Material','NO Plan',
    'Total Machine','Man Power',
  ];

  const dataRows = EXPORT_ORDER.map((id, idx) => {
    const meta  = MC_META[id] || { type:'', group:'', desc:'' };
    const stKey = statuses[id] || 'plan';
    const stName = STATUS_EXPORT_NAME[stKey] || stKey;
    const pn    = partNos[id] || '';

    if (idx === 0) return [
      idx + 1, id, meta.type, meta.group, meta.desc, stName, '', nowStr, pn,
      plan, actual, ng, diff, (actual / plan).toFixed(4),
      counts.running||0, counts.down||0, counts.setup||0, counts.damage||0,
      counts.qa||0, counts.manpower||0, counts.material||0, counts.plan||0,
      total, 21,
    ];

    return [idx + 1, id, meta.type, meta.group, meta.desc, stName, '', '', pn,
      '','','','','','','','','','','','','','',''];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = [
    {wch:5},{wch:8},{wch:8},{wch:14},{wch:36},{wch:16},{wch:12},{wch:20},{wch:20},
    {wch:12},{wch:12},{wch:8},{wch:12},{wch:12},{wch:8},{wch:14},{wch:12},{wch:12},
    {wch:16},{wch:14},{wch:12},{wch:8},{wch:14},{wch:12},
  ];

  const wb2 = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb2, ws, 'MC_status');
  XLSX.writeFile(wb2, 'M_C Status Data.xlsx');
}
