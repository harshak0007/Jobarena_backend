const passport = require('passport');
const User = require('../Model/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');

function generateDummyPassword() {
	// Generate a random string of characters for the dummy password
	const randomString = crypto.randomBytes(8).toString('hex');
	return randomString;
}

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: 'http://localhost:5000/api/user/google/callback',
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				console.log(profile);
				let user = await User.findOne({ googleId: profile.id });

				// If user already exists, return the user
				if (user) {
					return done(null, user);
				}

				// Check if the user's email already exists in the database
				const existingUser = await User.findOne({
					email: profile.emails[0].value,
				});

				if (existingUser) {
					// If the user's email already exists, associate the Google ID with the existing user
					// jjj
					// existingUser.googleId = profile.id;
					await existingUser.save();
					return done(null, existingUser);
				}
				const dummypass = generateDummyPassword();
				// If the user's email does not exist, create a new user account
				const newUser = new User({
					googleId: profile.id,
					name: profile.displayName,
					email: profile._json.email,
					password: dummypass,
					loginHistory: [], // Initialize the loginHistory array
				});
				await newUser.save();
				return done(null, newUser);
			} catch (error) {
				console.error('Error in Google OAuth callback:', error);
				return done(error, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (obj, done) => {
	try {
		const user = await User.findById(obj._id);
		done(null, user);
	} catch (err) {
		done(err, null);
	}
});
