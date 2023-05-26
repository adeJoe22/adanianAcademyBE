import { NextFunction, Response } from 'express';
import { IAuthRequest as IAdminREquest } from '../../interfaces';
import { environmentVariable } from '../../config';
import { authRoles } from '../../constants/auth';
import { AppError, HttpCode } from '../../utils';

export const isAdmin = async (req: IAdminREquest, res: Response, next: NextFunction) => {
  const user = req?.user;

  const adminEmails = environmentVariable?.ADMIN_EMAILS && (JSON.parse(environmentVariable.ADMIN_EMAILS) as string[]);

  const adminUser = user && user!.role === authRoles.admin && adminEmails?.includes(`${user!.email}`);

  if (!adminUser) next(new AppError({ message: 'You are not authorized', httpCode: HttpCode.FORBIDDEN }));

  next();
};
