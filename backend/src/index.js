require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const app      = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Vite dev port
app.use(express.json());

// Routes
app.use('/api/machines', require('./routes/machines'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));