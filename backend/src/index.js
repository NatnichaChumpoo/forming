require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const db       = require('./db');
const { getCorsOrigin } = require('./config');
const app      = express();

// สร้างตาราง production_summary อัตโนมัติตอน start (idempotent)
// รองรับ server ที่มี DB อยู่แล้ว ซึ่ง init.sql ไม่รันซ้ำ — deploy ได้โดยไม่ต้องรัน SQL มือ
async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS production_summary (
      id           INT          PRIMARY KEY DEFAULT 1,
      plan         BIGINT       NULL,
      actual       BIGINT       NULL,
      ng           BIGINT       NULL,
      man_power    INT          NULL,
      diff         BIGINT       NULL,
      productivity DECIMAL(6,2) NULL,
      updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by   VARCHAR(50)
    )`);
  await db.query('INSERT IGNORE INTO production_summary (id) VALUES (1)');
}

app.use(cors({ origin: getCorsOrigin(process.env.CORS_ORIGIN) }));
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/machines',   require('./routes/machines'));
app.use('/api/production', require('./routes/production'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
ensureSchema()
  .catch(err => console.error('ensureSchema failed (production API may not work):', err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  });
