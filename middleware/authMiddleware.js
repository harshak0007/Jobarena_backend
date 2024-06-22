const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const verifyToken = async (req, res, next) => {
	const token = req.headers['authorization'];
	console.log('hhh');
	console.log(token);

	if (!token) {
		return res.status(403).send('A token is required for authentication');
	}

	try {
		const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).send('User not found');
		}
		console.log(user);
		req.user = user;
	} catch (err) {
		return res.status(401).send('Invalid Token');
	}
	return next();
};

module.exports = verifyToken;
