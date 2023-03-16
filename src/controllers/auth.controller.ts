import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequestBody, IUser } from '../interfaces';
import {
  createUserProfileService,
  forgotPasswordService,
  getUserProfileService,
  loginService,
  refreshTokenService,
  registerService,
  removeUserService,
  resetPasswordService,
  updateUserProfile,
  verifyEmailService,
} from '../services';

export const registerController = (req: Request, res: Response, next: NextFunction) => registerService(req, res, next);

export const verifyEmailController = (req: Request, res: Response, next: NextFunction) =>
  verifyEmailService(req, res, next);

export const createUserProfileController = (req: Request, res: Response, next: NextFunction) =>
  createUserProfileService(req, res, next);

export const loginController = (req: Request, res: Response, next: NextFunction) => loginService(req, res, next);

export const getUserProfileController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getUserProfileService(req, res, next);

export const forgotPasswordController: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
  forgotPasswordService(req, res, next);

export const resetPasswordController: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
  resetPasswordService(req, res, next);

export const updateUserProfileController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  updateUserProfile(req, res, next);

export const removeUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  removeUserService(req, res, next);

export const refreshTokenController: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
  refreshTokenService(req, res, next);
