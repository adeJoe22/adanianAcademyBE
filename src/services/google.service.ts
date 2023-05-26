import { Response, Request, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import UserModel from '../models/User.model';
import { environmentVariable } from '../config';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser<any, any>((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: environmentVariable.PASSPORT_GOOGLE_CLIENT_ID,
      clientSecret: environmentVariable.PASSPORT_GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api-von/v1/auth/google/callback',
      scope: ['email', 'profile'],
      // passReqToCallback: true,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      console.log({ accessToken, profile });

      const user = await UserModel.findOne({ email: profile._json.email });
      if (!user) {
        let newUser = new UserModel({
          googleID: profile.id,
          firstName: profile._json.given_name,
          lastName: profile._json.family_name,
          profileImage: profile._json.picture,
          email: profile._json.email,
          isVerified: profile._json.email_verified,
          status: 'active',
          registrationType: 'google',
        });

        newUser.save();
        return done(null, newUser);
      } else {
        return done(null, user);
      }
    }
  )
);

export function googleSessionMiddleware(req: any, res: Response, next: NextFunction) {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb: any) => {
      cb();
    };
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb: any) => {
      cb();
    };
  }
  next();
}

export const sessionOptions = {
  name: `Session`,
  keys: [environmentVariable.SESSION_KEY],
  maxAge: 24 * 60 * 60 * 1000,
};
