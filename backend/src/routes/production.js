const router = require('express').Router();
const db     = require('../db');

// GET /api/production — คืนแถวสรุปยอดผลิต (แถวเดียว id=1)
router.get('/', async (req, res) => {
  try {
    const [[row]] = await db.query(
      'SELECT plan, actual, ng, man_power, diff, productivity, updated_at, updated_by FROM production_summary WHERE id = 1'
    );
    const data = row || { plan: 0, actual: 0, ng: 0, man_power: 0, diff: null, productivity: null };
    // DECIMAL ถูกคืนเป็น string จาก mysql2 → แปลงเป็น number (คง null ไว้ถ้าไม่มีค่า)
    if (data.productivity != null) data.productivity = Number(data.productivity);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/production — upsert ค่าจากแถว summary ของไฟล์ import
// diff/productivity: ถ้าส่ง null มา = ไฟล์ไม่ได้กรอก → เก็บ NULL ให้หน้าเว็บคำนวณเอง
router.put('/', async (req, res) => {
  const { plan, actual, ng, man_power, diff, productivity, updated_by } = req.body;
  const numOrNull = v => (v === null || v === undefined || v === '' ? null : Number(v));
  try {
    await db.query(
      `INSERT INTO production_summary (id, plan, actual, ng, man_power, diff, productivity, updated_by)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         plan         = VALUES(plan),
         actual       = VALUES(actual),
         ng           = VALUES(ng),
         man_power    = VALUES(man_power),
         diff         = VALUES(diff),
         productivity = VALUES(productivity),
         updated_by   = VALUES(updated_by)`,
      [
        numOrNull(plan),
        numOrNull(actual),
        numOrNull(ng),
        numOrNull(man_power),
        numOrNull(diff),
        numOrNull(productivity),
        updated_by || 'import',
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
