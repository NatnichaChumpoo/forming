// src/utils/api.js
const BASE = `http://${window.location.hostname}:4000/api`;

export async function fetchMachines() {
  const res = await fetch(`${BASE}/machines`);
  return res.json();
}

export async function updateStatus(machineId, status, remark, partNo) {
  const body = { status, remark, updated_by: 'operator' };
  if (partNo !== undefined) body.part_no = partNo;   // FIXED: ส่ง part_no เฉพาะตอนมีค่า
  const res = await fetch(`${BASE}/machines/${machineId}/status`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  return res.json();
}