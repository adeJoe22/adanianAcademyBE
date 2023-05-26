import { AuthenticatedRequestBody, IPaginationResponse, IUser } from '../interfaces';
import { adminGetUsersService, adminGetUserService } from '../services/admin.service';
import { Response, Request, NextFunction } from 'express';

export const adminGetUsersController = (req: Request, res: IPaginationResponse, next: NextFunction) =>
  adminGetUsersService(req, res, next);

export const adminGetUserController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  adminGetUserService(req, res, next);
