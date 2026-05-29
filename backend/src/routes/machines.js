const router = require('express').Router();
const db     = require('../db');

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
         remark     = VALUES(remark),
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

router.post('/', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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