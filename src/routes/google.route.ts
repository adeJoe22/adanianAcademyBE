import jwt, { JwtPayload } from 'jsonwebtoken';
import { Router, Request, Response } from 'express';
import { environmentVariable } from '../config';
import passport from 'passport';
import './../services/google.service';
import { IUser } from '../interfaces';
const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:5000/api-von/v1/auth/success',
    failureRedirect: 'http://localhost:5000/api-von/v1/auth/failure',
  })
);
router.route('/failure').get((req: Request, res: Response) => {
  return res.status(404).json({ message: 'Page not found' });
});

router.route('/success').get((req: Request, res: Response) => {
  const user = req.user as IUser;

  const payload: JwtPayload = {
    id: user?.id,
    email: user?.email,
    role: user?.role,
  };
  const encryptUser = jwt.sign(payload, environmentVariable.TOKEN_SECRET, {
    expiresIn: environmentVariable.JWT_EXPIRES,
  });

  // res.cookie('refreshToken', user?.refreshToken);
  return res.status(200).json({ message: `Welcome ${user?.firstName}`, data: { user, encryptUser } });
});

export default router;
