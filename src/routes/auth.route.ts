import { Router } from 'express';
import {
  createUserProfileController,
  forgotPasswordController,
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  removeUserController,
  resetPasswordController,
  updateUserProfileController,
  verifyEmailController,
} from '../controllers/auth.controller';
import { isAuthorized } from '../middlewares/auth';
import {
  createUserProfileValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  resetPasswordValidation,
  sendVerificationMailValidation,
  updateUserValidation,
  userIdValidation,
  verifyUserMailValidation,
} from '../middlewares/validation/authValidation/userValidation';

const router = Router();

router.post('/register', registerValidation, registerController);
router.get('/verify-email/:userId/:token', verifyUserMailValidation, verifyEmailController);
router.post('/create-profile/:userId', createUserProfileValidation, createUserProfileController);
router.post('/login', loginValidation, loginController);
router.post('/logout', refreshTokenValidation, logoutController);
router.get('/me', isAuthorized, getUserProfileController);
router.patch('/updateUser/:userId', isAuthorized, updateUserValidation, updateUserProfileController);
router.delete('/deleteUser/:userId', isAuthorized, userIdValidation, removeUserController);

router.post('/forget-password/:userId/:token', sendVerificationMailValidation, forgotPasswordController);
router.post('/reset-password/:userId/:token', resetPasswordValidation, resetPasswordController);

export default router;
