require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const { getCorsOrigin } = require('./config');
const app      = express();

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
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
