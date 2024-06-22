const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
	ipAddress: { type: String, required: true },
	browser: { type: String, required: true },
	os: { type: String, required: true },
	deviceType: { type: String, required: true },
	loginAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
	name: { type: String, required: true }, // Add the name field
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	phone: { type: String },
	loginHistory: [loginHistorySchema],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
