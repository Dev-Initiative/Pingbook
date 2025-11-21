import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../model/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        const googleAvatar = profile.photos?.[0]?.value;

        if (!user) {
          // Create a new user with all the correct fields
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            username: profile.name?.givenName, // Using first name as username
            avatar: googleAvatar || '',
            emailVerified: true,
          });
        } else {
          // If user exists, check if we need to update their avatar
          if (googleAvatar && user.avatar !== googleAvatar) {
            user.avatar = googleAvatar;
            await user.save();
          }
        }
        
        // Pass the complete user object to the next step
        return done(null, user);

      } catch (err) {
        console.error("Error in Google Strategy callback:", err);
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

export default passport;
