// src/routes/test.js
const { Router } = require('express');
const router = Router();

router.get('/ping', (req, res) => {
  res.json({ pong: true });
});

module.exports = router;