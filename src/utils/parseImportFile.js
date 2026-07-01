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

  // คอลัมน์สรุปยอดผลิต (มาจากแถว summary แถวเดียว)
  const idxPlan     = headerRow.findIndex(h => h.includes('plan') && !h.includes('no plan'));
  const idxActual   = headerRow.findIndex(h => h.includes('actual'));
  const idxNg       = headerRow.findIndex(h => /(^|\W)ng(\W|$)/.test(h)); // กัน "running"
  // "Man Power" (ยอดคน) ต้องไม่ชนกับคอลัมน์สถานะ "NO Manpower"
  const idxManPower = headerRow.findIndex(h => (h.includes('man power') || h.includes('manpower')) && !h.includes('no man'));
  // diff/productivity: ถ้าไฟล์กรอกมาจะใช้ค่าจากไฟล์ (สูตรโรงงาน) ถ้าเว้นว่างเว็บคำนวณเอง
  const idxDiff         = headerRow.findIndex(h => h.includes('diff'));
  const idxProductivity = headerRow.findIndex(h => h.includes('productivity'));

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

  // ── แถว summary: ดึงยอดผลิตรวม แล้วเขียนลง production_summary ──
  // แถว summary = แถวแรกที่มีค่า Plan เป็นตัวเลข
  // ช่องว่าง/ไม่ใช่ตัวเลข → null (เว็บจะแสดงเป็น "–"), มีค่า → ตัวเลข
  const toNumOrNull = v => {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    const n = Number(String(v).replace(/[, %]/g, ''));
    return Number.isFinite(n) ? n : null;
  };
  let newProduction = null;
  if (idxPlan !== -1) {
    // แถว summary = แถวแรกหลัง header ที่มีข้อมูล (ฟอร์แมต export วางยอดรวมไว้แถวแรก)
    // อ่านและเขียนทับทุกครั้งเพื่อสะท้อนไฟล์ตรง ๆ — ช่องว่าง/0 จะแสดงเป็น "–"
    const summaryRow = rows.slice(headerRowIndex + 1)
      .find(r => r && r.some(c => String(c ?? '').trim() !== ''));
    if (summaryRow) {
      newProduction = {
        plan:         toNumOrNull(summaryRow[idxPlan]),
        actual:       idxActual   !== -1 ? toNumOrNull(summaryRow[idxActual])   : null,
        ng:           idxNg       !== -1 ? toNumOrNull(summaryRow[idxNg])       : null,
        man_power:    idxManPower !== -1 ? toNumOrNull(summaryRow[idxManPower]) : null,
        diff:         idxDiff         !== -1 ? toNumOrNull(summaryRow[idxDiff])         : null,
        productivity: idxProductivity !== -1 ? toNumOrNull(summaryRow[idxProductivity]) : null,
        updated_by:   'import',
      };
      try {
        await fetch(`${BASE()}/production`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(newProduction),
        });
      } catch (_) { /* ไม่ให้ล้มทั้ง import ถ้า production เขียนไม่สำเร็จ */ }
    }
  }

  if (lastSavedRef) lastSavedRef.current = Date.now();

  const failed = results
    .map((r, i) => r.status === 'rejected' ? toUpdate[i].machineId : null)
    .filter(Boolean);

  const updatedCount = toUpdate.length - failed.length;

  let summary = `✓ ${updatedCount} machines updated`;
  if (failed.length)  summary += ` · ⚠ ${failed.length} failed: ${failed.join(', ')}`;
  if (skipped.length) summary += ` · skipped ${skipped.length}: ${skipped.join(', ')}`;

  return { newStatuses, newPartNos, newProduction, updatedCount, summary };
}