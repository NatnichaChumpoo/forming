// src/utils/parseImportFile.js
// อ่านไฟล์ Excel MC Daily Status แล้ว PATCH สถานะลง DB

// อิง IMPORT_STATUS_MAP จาก src/data/statuses.js โดยตรง ไม่ hardcode ใหม่
// { 'running':'running', 'machine down':'down', ... }

const BASE = () => `http://${window.location.hostname}:4000/api`;

async function parseImportFile(arrayBuffer, statuses, partNos, lastSavedRef) {
  // อ่าน Excel (XLSX มาจาก cdn ที่ main.jsx โหลดอยู่แล้ว)
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // row 0 = header (Status, MC No., Part No) → ข้ามไป
  const dataRows = rows.slice(1).filter(r => r[1]);

  const newStatuses = { ...statuses };
  const newPartNos  = { ...partNos  };
  const toUpdate    = []; // เครื่องที่จะ PATCH
  const skipped     = []; // เครื่องที่ข้าม พร้อมเหตุผล

  for (const row of dataRows) {
    const rawStatus = String(row[0] ?? '').trim().toLowerCase();
    const machineId = String(row[1] ?? '').trim().toUpperCase();
    const rawPartNo = row[2] !== undefined ? String(row[2]).trim() : '';

    // ตรวจว่า machineId มีในระบบ
    if (!(machineId in newStatuses)) {
      skipped.push(`${machineId} (ไม่มีในระบบ)`);
      continue;
    }

    // map status โดยอิงจาก IMPORT_STATUS_MAP ใน statuses.js
    const mappedStatus = IMPORT_STATUS_MAP[rawStatus];
    if (!mappedStatus) {
      skipped.push(`${machineId} (status ไม่รู้จัก: "${row[0]}")`);
      continue;
    }

    newStatuses[machineId] = mappedStatus;
    if (rawPartNo) newPartNos[machineId] = rawPartNo;

    toUpdate.push({ machineId, status: mappedStatus, partNo: rawPartNo });
  }

  // ── PATCH ทุกเครื่องพร้อมกัน ──
  const results = await Promise.allSettled(
    toUpdate.map(({ machineId, status, partNo }) =>
      fetch(`${BASE()}/machines/${machineId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          status,
          part_no:    partNo || null,  // FIXED: ส่ง part_no ไปพร้อม status
          updated_by: 'import',
        }),
      }).then(r => r.json())
    )
  );

  // กัน poll 5s เขียนทับค่าที่ import มา
  if (lastSavedRef) lastSavedRef.current = Date.now();

  // แยก success / failed
  const failed = results
    .map((r, i) => r.status === 'rejected' ? toUpdate[i].machineId : null)
    .filter(Boolean);

  const updatedCount = toUpdate.length - failed.length;

  // สร้าง feedback ให้ Sidebar แสดง
  let summary = `✓ ${updatedCount} machines updated`;
  if (failed.length)  summary += ` · ⚠ ${failed.length} failed: ${failed.join(', ')}`;
  if (skipped.length) summary += ` · skipped ${skipped.length}: ${skipped.join(', ')}`;

  return { newStatuses, newPartNos, updatedCount, summary };
}