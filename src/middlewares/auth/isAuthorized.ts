import { NextFunction, Response, Request } from 'express';
import jwt, { Secret, VerifyErrors } from 'jsonwebtoken';
import { IAuthRequest, IUser } from '../../interfaces';
import { asyncHandler } from './../../utils/asyncHandler';
import { AppError, HttpCode } from '../../utils';
import { environmentVariable } from '../../config';
import UserModel from './../../models/User.model';

export const isAuthorized = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const authHeaders = (req && req.headers.authorization) || (req && req.headers.Authorization);

  if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
    next(
      new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        message: 'Invalid Bearer',
      })
    );
  }
  const token =
    (authHeaders && authHeaders.split(' ')[1]) || req?.cookies?.authToken || req?.cookies?.accessToken || '';
  if (!token)
    next(
      new AppError({
        message: 'Invalid token',
        httpCode: HttpCode.UNAUTHORIZED,
      })
    );

  jwt.verify(
    token,
    environmentVariable.ACCESS_TOKEN_SECRET_KEY as Secret,
    async (err: VerifyErrors | null, decodedUser: any) => {
      // check for errors
      if (err) {
        const errorMsg = err.name === 'JsonWebTokenError' ? 'Auth Failed (Unauthorized)' : err.message;
        next(
          new AppError({
            httpCode: HttpCode.UNAUTHORIZED,
            message: errorMsg,
          })
        );
      }

      //decode user if verified
      const verifiedUser = await UserModel.findOne({
        _id: decodedUser!.userId,
      }).select('-password -confirmPassword');

      if (!verifiedUser) {
        next(
          new AppError({
            httpCode: HttpCode.UNAUTHORIZED,
            message: 'Unauthorized user',
          })
        );
      }

      //requesting for the authorized User
      req.user = verifiedUser as IUser;
      // if Successful move to the next middleware
      next();
    }
  );
});
