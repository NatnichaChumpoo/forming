const router = require('express').Router();
const db     = require('../db');

// GET /api/machines — ดึงเครื่องทั้งหมดพร้อมสถานะ
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.status, s.part_no, s.remark, s.updated_at, s.updated_by
      FROM machines m
      LEFT JOIN machine_status s ON m.id = s.machine_id
      ORDER BY m.id
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH /api/machines/:id/status — เปลี่ยนสถานะเครื่อง
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, remark, updated_by, part_no } = req.body;

  try {
    const [[old]] = await db.query(
      'SELECT status FROM machine_status WHERE machine_id = ?', [id]
    );

    await db.query(
      `INSERT INTO machine_status (machine_id, status, part_no, remark, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status     = VALUES(status),
         part_no    = IF(VALUES(part_no) IS NULL, part_no, VALUES(part_no)),
         remark     = VALUES(remark),
         updated_by = VALUES(updated_by)`,
      [id, status, part_no !== undefined ? (part_no || null) : undefined, remark || null, updated_by || 'system']
    );

    await db.query(
      `INSERT INTO status_logs (machine_id, old_status, new_status, remark, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [id, old?.status || null, status, remark || null, updated_by || 'system']
    );

    res.json({ ok: true, machine_id: id, status });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
module.exports = router;
