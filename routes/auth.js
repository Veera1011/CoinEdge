const express = require('express');
const { userLogin,tokenValidation } = require('../controllers/auth/login');
const { userRegistration } = require('../controllers/register/userRegistration');
const { forgotPassword } = require('../controllers/auth/forgotPassword');
const { resetPassword } = require('../controllers/auth/resetPassword');

const { verifyFirebaseToken, getFirebaseConfig } = require('../controllers/auth/firebaseAuth');
const router = express.Router();


  router.get('/login', (req, res) => {
  res.render('login', { title: 'CoinEdge - Sign in' });
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'CoinEdge - Sign up' });
});
router.get('/forgot-password', (req,res)=>{
  res.render('forgot-password',{ title: 'CoinEdge - forgot-password' })
})
router.get('/reset-password', (req,res)=>{
  res.render('reset-password',{ title: 'CoinEdge - reset-password' })
})
router.post('/registration' , userRegistration)
router.post('/login' , userLogin)
router.post('/forgot-password' , forgotPassword)
router.post('/reset-password' , resetPassword)

router.post('/validate-token', tokenValidation);
router.post('/firebase/verify', verifyFirebaseToken);
router.get('/firebase/config', getFirebaseConfig);


module.exports = router;