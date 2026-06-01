const router = require('express').Router();

router.post('/verify', (req, res) => {
  const { pin } = req.body;
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ ok: false, error: 'PIN ไม่ถูกต้อง' });
  }
  res.json({ ok: true });
});

module.exports = router;
