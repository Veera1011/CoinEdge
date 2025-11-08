const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const cryptoController = require('../controllers/crypto/cryptoController');
const dashboardController = require('../controllers/dashboard/dashboardController');
const depositController = require('../controllers/deposit/depositController');
const { 
    createWithdrawal, 
    getWithdrawalHistory, 
    updateWithdrawalStatus, 
    getUserBalance 
} = require('../controllers/withdraw/withdrawController');

const router = express.Router();

// ============ PAGE ROUTES (No Auth Required for Rendering) ============

router.get('/dashboard', async (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

router.get('/trading', (req, res) => {
    res.render('trading', { title: 'CoinEdge - trading' });
});

router.get('/portfolio', async (req, res) => {
    try {
        res.render('portfolio', { title: 'Portfolio' });
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

// ============ API ENDPOINTS (Auth Required) ============

// Crypto Data (Public)
router.get('/cryptos/top10', cryptoController.fetchTop10Cryptos);

// Contact Form (Public)
router.post('/contact', cryptoController.usercontact);

// ============ USER DASHBOARD DATA ============
router.get('/api/dashboard-data', authMiddleware, dashboardController.getDashboardData);
router.get('/api/profile', authMiddleware, dashboardController.getUserProfile);
router.get('/api/transactions', authMiddleware, dashboardController.getUserTransactions);
router.put('/api/today-report', authMiddleware, dashboardController.updateTodayReport);
router.put('/api/holdings', authMiddleware, dashboardController.updateHoldings);

// ============ WITHDRAWAL ENDPOINTS ============
router.post('/api/withdraw/create', authMiddleware, createWithdrawal);
router.get('/api/withdraw/history', authMiddleware, getWithdrawalHistory);
router.get('/api/withdraw/balance', authMiddleware, getUserBalance);
router.put('/api/withdraw/update/:withdrawalId', authMiddleware, updateWithdrawalStatus);

// ============ DEPOSIT ENDPOINTS ============
router.post('/api/deposit/record', authMiddleware, depositController.recordDeposit);
router.get('/api/deposit/history', authMiddleware, depositController.getDepositHistory);
router.get('/api/deposit/addresses', authMiddleware, depositController.getDepositAddresses);

module.exports = router;