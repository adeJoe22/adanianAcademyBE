import { Request, Response, NextFunction } from 'express';
import { AppError, HttpCode, asyncHandler, isValidMongooseObjectId } from '../utils';
import { AuthenticatedRequestBody, IPaginationResponse, IUser } from '../interfaces';
import UserModel from '../models/User.model';

export const adminGetUsersService = asyncHandler(async (req: Request, res: IPaginationResponse, next: NextFunction) => {
  if (res?.paginatedResults) {
    const { results, next, previous, currentPage, totalDocs, totalPages, lastPage } = res.paginatedResults;
    const responseObject: any = {
      totalDocs: totalDocs || 0,
      totalPages: totalPages || 0,
      lastPage: lastPage || 0,
      count: results?.length || 0,
      currentPage: currentPage || 0,
    };

    if (next) {
      responseObject.nextPage = next;
    }
    if (previous) {
      responseObject.previousPage = previous;
    }

    responseObject.users = results?.map((userDoc: any) => {
      return {
        ...userDoc?._doc,
        request: {
          type: 'Get',
          description: 'Get user info',
          url: `http://localhost:5000/von-api/v1/admin/users/${userDoc?._doc?._id}`,
        },
      };
    });

    return res.status(200).json({
      message: 'Users Found',
      data: responseObject,
    });
  }
});

export const adminGetUserService = asyncHandler(
  async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
    if (!isValidMongooseObjectId(req.params?.userId) || !req.params.userId) {
      next(new AppError({ message: 'Invalid Request', httpCode: HttpCode.UNPROCESSABLE_IDENTITY }));
    }

    const user = await UserModel.findById(req?.params?.userId);
    if (!user) {
      next(new AppError({ message: 'User not found', httpCode: HttpCode.BAD_REQUEST }));
    }

    const { password, confirmPassword, ...otherUserInfo } = user?._doc;

    return res.status(200).json({
      message: `Successfully found user by ID: ${req.params.userId} profile 🍀`,
      data: { otherUserInfo },
    });
  }
);
