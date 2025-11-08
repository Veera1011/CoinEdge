const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const cryptoController = require('../controllers/crypto/cryptoController');
const { createWithdrawal, getWithdrawalHistory, updateWithdrawalStatus, getUserBalance } = require('../controllers/withdraw/withdrawController');
const router = express.Router();

// settings , market , portfolio , trading , dashboard
  router.get('/dashboard', async (req, res) => {
      
          res.render('dashboard', {
              title: 'Dashboard' });
  });

router.get('/trading', (req, res) => {
  res.render('trading', { title: 'CoinEdge - trading' });
});
router.get('/portfolio', async (req, res) => {
    try {
        res.render('portfolio', { title: 'Portfolio'   });
    } catch (error) {
        console.error('Portfolio error:', error);
        res.render('portfolio', {
            title: 'Portfolio',
            cryptoData: null
        });
    }
});

router.get('/market', (req, res) => {
  res.render('market', { title: 'CoinEdge - market' });
});
router.get('/settings', (req, res) => {
  res.render('settings', { title: 'CoinEdge - settings' });
});

router.get('/withdraw', (req, res) => {
  res.render('withdraw', { title: 'CoinEdge - withdraw' });
});

router.get('/customer-care', (req, res) => {
  res.render('customercare', { title: 'CoinEdge - customer-care' });
});


router.get('/deposit', (req, res) => {
  res.render('deposit', { title: 'CoinEdge - deposit' });
});

router.get('/loan', (req, res) => {
  res.render('loans', { title: 'CoinEdge - loans' });
});

router.get('/transfer', (req, res) => {
  res.render('transfer', { title: 'CoinEdge - transfer' });
});
// API endpoint for real-time updates
router.get('/cryptos/top10', cryptoController.fetchTop10Cryptos );

router.post('/contact', cryptoController.usercontact );
// Create withdrawal request (protected route)
router.post('/create',createWithdrawal);

// Get user's withdrawal history (protected route)
router.get('/history/:userId', getWithdrawalHistory);

// Get user balance (protected route)
router.get('/balance/:userId',getUserBalance);

// Update withdrawal status (admin route - you might want to add admin middleware)
router.put('/update/:withdrawalId', updateWithdrawalStatus);


module.exports = router;






