// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UAParser = require('ua-parser-js');
const User = require('../Model/User');

exports.signup = async (req, res) => {
	try {
		const { name, email, password, phone } = req.body;
		console.log(req.body);

		// const existingUser = await User.findOne({ email });
		// if (existingUser) {
		// 	return res.status(400).json({ message: 'Email already in use' });
		// }

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ name, email, password: hashedPassword, phone });
		console.log(req.headers['user-agent']);
		const parser = new UAParser(req.headers['user-agent']);
		const userAgent = parser.getResult();
		const ipAddress =
			req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		const userd = {
			ipAddress,
			browser: userAgent.browser.name,
			os: userAgent.os.name,
			deviceType: userAgent.device.type || 'desktop',
		};
		console.log(userd);
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
		console.log(token);

		res.status(201).json({ token, sessionId });
	} catch (error) {
		console.error('Error signing up:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log(email);
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		console.log(password);

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
		res.status(200).json({ name: user.name, token, sessionId });
	} catch (error) {
		console.error('Error logging in:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.getLoginHistory = async (req, res) => {
	try {
		console.log('hello');
		const loginHistory = req.user.loginHistory;
		res.status(200).json(loginHistory);
	} catch (error) {
		res.status(500).send('Error retrieving login history');
	}
};
exports.getUser = async (req, res) => {
	try {
		const name = req.user.name;
		res.status(200).json(name);
	} catch (error) {
		res.status(500).send('Error retrieving details');
	}
};
exports.getUserData = async (req, res) => {
	try {
		const data = req.user;
		res.status(200).json(data);
	} catch (error) {
		res.status(500).send('Error retrieving details');
	}
};
exports.googleCallback = async (req, res) => {
	try {
		const user = req.user;
		console.log(user);

		// Ensure loginHistory is initialized
		if (!user.loginHistory) {
			user.loginHistory = [];
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
		console.log(user);

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});
		const sessionId = uuidv4();
		// res.status(200).json({ token, sessionId });
		res.redirect(`http://localhost:5173?token=${token}&sessionId=${sessionId}`);
	} catch (error) {
		console.error('Error logging in with Google:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
