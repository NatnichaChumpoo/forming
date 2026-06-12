const router    = require('express').Router();
const db        = require('../db');
const adminAuth = require('../middleware/adminAuth');

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
         remark     = IF(VALUES(remark) IS NULL, remark, VALUES(remark)),
         updated_by = VALUES(updated_by)`,
      [id, status, part_no || null, remark || null, updated_by || 'system']
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

router.post('/', adminAuth, async (req, res) => {
  const { id, category, cap } = req.body;
  if (!id || !category || !cap) {
    return res.status(400).json({ ok: false, error: 'id, category, cap are required' });
  }
  try {
    await db.query(
      `INSERT INTO machines (id, display_id, category, cap, zone, x, y)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id.toUpperCase(), id.toUpperCase(), category, cap, id[0].toUpperCase(), 200, 60]
    );
    await db.query(
      `INSERT INTO machine_status (machine_id, status) VALUES (?, 'running')`,
      [id.toUpperCase()]
    );
    res.json({ ok: true, id: id.toUpperCase() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.patch('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { category, cap, display_id, x, y } = req.body;
  try {
    await db.query(
      `UPDATE machines SET
         category   = COALESCE(?, category),
         cap        = COALESCE(?, cap),
         display_id = COALESCE(?, display_id),
         x          = COALESCE(?, x),
         y          = COALESCE(?, y)
       WHERE id = ?`,
      [category || null, cap || null, display_id || null, x !== undefined ? Number(x) : null, y !== undefined ? Number(y) : null, id]
    );
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Rename primary key (id) — transaction-safe ──
// PATCH /api/machines/:id/rename-id  body: { new_id: "C03" }
router.patch('/:id/rename-id', adminAuth, async (req, res) => {
  const oldId = req.params.id.toUpperCase();
  const newId = (req.body.new_id || '').trim().toUpperCase();

  if (!newId) {
    return res.status(400).json({ ok: false, error: 'new_id is required' });
  }
  if (newId === oldId) {
    return res.status(400).json({ ok: false, error: 'new_id must differ from current id' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ตรวจ id ใหม่ไม่ซ้ำ
    const [[existing]] = await conn.query(
      'SELECT id FROM machines WHERE id = ?', [newId]
    );
    if (existing) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ ok: false, error: `ID "${newId}" already exists` });
    }

    // ปิด FK ชั่วคราว เพื่อ update primary key ได้
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    await conn.query(
      'UPDATE status_logs    SET machine_id = ? WHERE machine_id = ?', [newId, oldId]
    );
    await conn.query(
      'UPDATE machine_status SET machine_id = ? WHERE machine_id = ?', [newId, oldId]
    );
    await conn.query(
      `UPDATE machines SET id = ?, display_id = ?, zone = ?
       WHERE id = ?`,
      [newId, newId, newId[0], oldId]
    );

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.commit();
    conn.release();

    res.json({ ok: true, old_id: oldId, new_id: newId });
  } catch (err) {
    await conn.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    await conn.rollback().catch(() => {});
    conn.release();
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM status_logs   WHERE machine_id = ?`, [id]);
    await db.query(`DELETE FROM machine_status WHERE machine_id = ?`, [id]);
    await db.query(`DELETE FROM machines       WHERE id = ?`, [id]);
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;