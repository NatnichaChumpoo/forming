const BASE = () => `http://${window.location.hostname}:4000/api`;

async function parseImportFile(arrayBuffer, statuses, partNos, lastSavedRef) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // หา header row อัตโนมัติ — scan 10 แถวแรก
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = (rows[i] || []).map(h => String(h ?? '').trim().toLowerCase());
    if (r.some(h => h.includes('mc no') || h.includes('m/c no'))) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = (rows[headerRowIndex] || []).map(h => String(h ?? '').trim().toLowerCase());

  // รองรับชื่อคอลัมน์หลายแบบ
  const idxStatus = headerRow.findIndex(h => h.includes('status'));
  const idxMcNo   = headerRow.findIndex(h => h.includes('mc no') || h.includes('m/c no'));
  const idxPartNo = headerRow.findIndex(h => h.includes('part no'));

  if (idxStatus === -1 || idxMcNo === -1) {
    return {
      newStatuses: statuses,
      newPartNos:  partNos,
      updatedCount: 0,
      summary: '⚠ ไฟล์ไม่ถูกต้อง — ไม่พบคอลัมน์ที่ต้องการ',
    };
  }

  const dataRows = rows.slice(headerRowIndex + 1).filter(r => r[idxMcNo]);

  const newStatuses = { ...statuses };
  const newPartNos  = { ...partNos  };
  const toUpdate    = [];
  const skipped     = [];

  for (const row of dataRows) {
    const rawStatus = String(row[idxStatus] ?? '').trim().toLowerCase();
    const machineId = String(row[idxMcNo]   ?? '').trim().toUpperCase();
    const rawPartNo = idxPartNo !== -1 && row[idxPartNo] !== undefined
      ? String(row[idxPartNo]).trim()
      : '';

    if (!(machineId in newStatuses)) {
      skipped.push(`${machineId} (ไม่มีในระบบ)`);
      continue;
    }

    const mappedStatus = IMPORT_STATUS_MAP[rawStatus];
    if (!mappedStatus) {
      skipped.push(`${machineId} (status ไม่รู้จัก: "${row[idxStatus]}")`);
      continue;
    }

    newStatuses[machineId] = mappedStatus;
    if (rawPartNo) newPartNos[machineId] = rawPartNo;
    toUpdate.push({ machineId, status: mappedStatus, partNo: rawPartNo });
  }

  const results = await Promise.allSettled(
    toUpdate.map(({ machineId, status, partNo }) =>
      fetch(`${BASE()}/machines/${machineId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          status,
          part_no:    partNo || null,
          updated_by: 'import',
        }),
      }).then(r => r.json())
    )
  );

  if (lastSavedRef) lastSavedRef.current = Date.now();

  const failed = results
    .map((r, i) => r.status === 'rejected' ? toUpdate[i].machineId : null)
    .filter(Boolean);

  const updatedCount = toUpdate.length - failed.length;

  let summary = `✓ ${updatedCount} machines updated`;
  if (failed.length)  summary += ` · ⚠ ${failed.length} failed: ${failed.join(', ')}`;
  if (skipped.length) summary += ` · skipped ${skipped.length}: ${skipped.join(', ')}`;

  return { newStatuses, newPartNos, updatedCount, summary };
}