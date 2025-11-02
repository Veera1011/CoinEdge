const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'CoinEdge - Home' });
  });

module.exports = router;