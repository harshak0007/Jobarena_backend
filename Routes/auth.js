const express = require('express');
const passport = require('passport');
const {
	sendOtpPhone,
	verifyOtpPhone,
	sendOtpEmail,
	verifyOtpEmail,
	sendOtpEmailLogin,
	verifyOtpEmailEmail,
	sendOtpPhoneLogin,
	verifyOtpPhoneLogin,
} = require('../utils/otp');
const verifyToken = require('../middleware/authMiddleware');

const auth = require('../utils/user');

const router = express.Router();

// Google OAuth routes
router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);
router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	auth.googleCallback
);

router.post('/login', auth.login);
router.post('/signup', auth.signup);

router.post('/data', verifyToken, auth.getUser);
router.post('/userData', verifyToken, auth.getUserData);
// Phone OTP routes
router.post('/send-otp-phone', verifyToken, sendOtpPhone);
router.post('/send-otp-phone-login', sendOtpPhoneLogin);
router.post('/verify-otp-phone', verifyToken, verifyOtpPhone);
router.post('/verify-otp-login-phone', verifyOtpPhoneLogin);

// Email OTP routes
router.post('/send-otp-email', verifyToken, sendOtpEmail);
router.post('/send-otp-email-login', sendOtpEmailLogin);
router.post('/verify-otp-email', verifyToken, verifyOtpEmail);
router.post('/verify-otp-login', verifyOtpEmailEmail);

router.get('/login-history', verifyToken, auth.getLoginHistory);

router.get('/logout', (req, res) => {
	req.logout();
	// Redirect or respond as per your application's requirements after logging out
	res.redirect('/');
});

module.exports = router;
