const twilio = require('twilio');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');
const User = require('../Model/User');

// Twilio setup
const twilioClient = twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

// Nodemailer setup
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// OTP storage
const otpsPhone = {};
const otpsEmail = {};

// Generate OTP
const generateOtp = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP to phone
const sendOtpPhone = (req, res) => {
	const phoneno = req.user.phone;
	const phone = '+91' + phoneno;
	console.log(phone);

	if (!phone) {
		return res
			.status(400)
			.json({ success: false, message: 'Phone number is required' });
	}

	const otp = generateOtp();
	otpsPhone[phone] = otp;

	twilioClient.messages
		.create({
			body: `Your OTP code is: ${otp}`,
			from: process.env.TWILIO_PHONE_NUMBER,
			to: phone,
		})
		.then(message => {
			res.status(200).json({ success: true });
		})
		.catch(error => {
			console.error('Error sending OTP: ', error);
			res.status(500).json({ success: false, error: error.toString() });
		});
};

// Verify OTP for phone
const verifyOtpPhone = (req, res) => {
	const phoneno = req.user.phone;
	const phone = '+91' + phoneno;
	console.log(otpsPhone);
	const { otp } = req.body;
	console.log(otp);
	if (otpsPhone[phone] && otpsPhone[phone] === otp) {
		delete otpsPhone[phone]; // Clear OTP after verification
		return res.status(200).json({ success: true });
	} else {
		return res.status(400).json({ success: false, message: 'Invalid OTP' });
	}
};

// Send OTP to email
const sendOtpEmail = (req, res) => {
	const email = req.user.email;
	console.log(email);
	console.log(process.env.EMAIL_USER);
	const otp = generateOtp();
	otpsEmail[email] = otp;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Your OTP Code',
		text: `Your OTP code is: ${otp}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.status(500).json({ success: false, error: error.toString() });
		} else {
			return res.status(200).json({ success: true });
		}
	});
};
const sendOtpEmailLogin = (req, res) => {
	const { email } = req.body;
	console.log(email);
	console.log(process.env.EMAIL_USER);
	const otp = generateOtp();
	otpsEmail[email] = otp;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Your OTP Code',
		text: `Your OTP code is: ${otp}`,
	};

	transporter.sendMail(mailOptions, async (error, info) => {
		if (error) {
			return res.status(500).json({ success: false, error: error.toString() });
		} else {
			return res.status(200).json({ success: true });
		}
	});
};

// Verify OTP for email
const verifyOtpEmail = (req, res) => {
	const email = req.user.email;
	const { otp } = req.body;
	if (otpsEmail[email] && otpsEmail[email] === otp) {
		delete otpsEmail[email]; // Clear OTP after verification
		return res.status(200).json({ success: true });
	} else {
		return res.status(400).json({ success: false, message: 'Invalid OTP' });
	}
};
const verifyOtpEmailEmail = async (req, res) => {
	const { email } = req.body;
	const { otp } = req.body;
	console.log(email);
	console.log(otp);
	console.log(otpsEmail);
	if (otpsEmail[email] && otpsEmail[email] === otp) {
		console.log('hello');
		delete otpsEmail[email]; // Clear OTP after verification
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
		const parser = new UAParser(req.headers['user-agent']);
		const userAgent = parser.getResult();
		const ipAddress =
			req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		user.loginHistory.push({
			ipAddress,
			browser: userAgent.browser.name,
			os: userAgent.os.name,
			deviceType: userAgent.device.type || 'desktop',
		});
		await user.save();

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});
		const sessionId = uuidv4();
		console.log(sessionId);
		return res.status(200).json({ name: user.name, token, sessionId });
	} else {
		return res.status(400).json({ success: false, message: 'Invalid OTP' });
	}
};

module.exports = {
	sendOtpPhone,
	verifyOtpPhone,
	sendOtpEmail,
	verifyOtpEmail,
	sendOtpEmailLogin,
	verifyOtpEmailEmail,
};
