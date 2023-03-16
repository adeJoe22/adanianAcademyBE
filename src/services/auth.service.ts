import { Request, Response, NextFunction, RequestHandler, response } from 'express';
import { SignOptions, Secret } from 'jsonwebtoken';
import { environmentVariable } from '../config';
import TokenModel from '../models/Token.model';
import UserModel from '../models/User.model';
import { AppError, HttpCode } from '../utils';
import { asyncHandler } from './../utils/asyncHandler';
import verifyRefreshToken from '../middlewares/auth/verifyRefreshToken';
import { sendConfirmResetPasswordEmail, sendResetPasswordEmail, verifyUserEmail } from '../utils/emailConfig';
import { AuthenticatedRequestBody, IUser } from '../interfaces';

export const registerService = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body || {};

  const newUser = new UserModel({ email });
  const user = await newUser.save();

  let token = new TokenModel({ userId: user._id });

  const payload = {
    userId: user._id,
  };

  const accessTokenSecretKey = environmentVariable.ACCESS_TOKEN_SECRET_KEY as Secret;
  const accessTokenOptions: SignOptions = {
    expiresIn: environmentVariable.ACCESS_TOKEN_KEY_EXPIRE_TIME,
    issuer: environmentVariable.JWT_ISSUER,
    audience: String(user._id),
  };

  const refreshTokenSecretKey = environmentVariable.REFRESH_TOKEN_SECRET_KEY as Secret;
  const refreshTokenOptions: SignOptions = {
    expiresIn: environmentVariable.REFRESH_TOKEN_KEY_EXPIRE_TIME,
    issuer: environmentVariable.JWT_ISSUER,
    audience: String(user._id),
  };

  // Generate and set verify email token
  const generateAccessToken = await token.generateToken(payload, accessTokenSecretKey, accessTokenOptions);
  const generateRefreshToken = await token.generateToken(payload, refreshTokenSecretKey, refreshTokenOptions);

  token!.refreshToken = generateRefreshToken;
  token!.accessToken = generateAccessToken;
  token = await token.save();

  const verifyEmailLink = `${environmentVariable.WEBSITE_URL}/verify-email/${user._id}/${token.refreshToken}`;

  // // send email for verification
  const verifyingUser = {
    email: user!.email,
    id: user!._id,
    status: user!.status,
    link: verifyEmailLink,
  };
  await verifyUserEmail(verifyingUser).then(() => console.log(`Email has been sent to${user!.email}`));

  const data = {
    user: {
      accessToken: token!.accessToken,
      refreshToken: token!.refreshToken,
    },
  };

  return res.status(201).json({
    data,
  });
});

export const verifyEmailService = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserModel.findById(req.params.userId);
  if (!user)
    next(
      new AppError({
        message: 'Email verification token is invalid or has expired. Please click on resend for verify your Email.',
        httpCode: HttpCode.BAD_REQUEST,
      })
    );

  //User is already verified
  if (user!.isVerified && user!.status === 'active') {
    return res.status(200).json({
      message: 'Your email is already verified, Please Login',
    });
  }

  const emailVerificationToken = await TokenModel.findOne({
    userId: user!._id,
    refreshToken: req.params.token,
  });

  if (!emailVerificationToken)
    next(
      new AppError({
        message: 'Email verification token is invalid or has expired.',
        httpCode: HttpCode.BAD_REQUEST,
      })
    );

  // Verify the user
  user!.isVerified = true;
  user!.status = 'active';
  await user!.save();
  await emailVerificationToken!.delete();

  return res.status(200).json({
    status: 'success',
    message: 'Your account has been successfully verified . Please proceed to create your profile.',
  });
});

export const createUserProfileService = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    firstName,
    lastName,
    password,
    confirmPassword,
    gender,
    mobileNumber,
    address,
    dateOfBirth,
    how_did_you_find_us,
    educational_level,
    country_of_residence,
    state_of_residence,
    computer_skill_level,
    do_you_have_access_to_laptop,
    have_you_taken_any_tech_training,
    profileImage,
  } = req.body;

  const user = await UserModel.findById(req.params.userId);
  if (!user) {
    next(
      new AppError({
        message: 'Please sign up you have not been verified',
        httpCode: HttpCode.NOT_FOUND,
      })
    );
  }

  user!.firstName = firstName;
  user!.lastName = lastName;
  user!.gender = gender;
  user!.dateOfBirth = dateOfBirth;
  user!.mobileNumber = mobileNumber;
  user!.address = address;
  user!.password = password;
  user!.confirmPassword = confirmPassword;
  user!.how_did_you_find_us = how_did_you_find_us;
  user!.educational_level = educational_level;
  user!.country_of_residence = country_of_residence;
  user!.state_of_residence = state_of_residence;
  user!.computer_skill_level = computer_skill_level;
  user!.do_you_have_access_to_laptop = do_you_have_access_to_laptop;
  user!.have_you_taken_any_tech_training = have_you_taken_any_tech_training;
  user!.profileImage = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();

  const uploadUserProfile = await user!.save();

  res.status(200).json({
    message: 'Successful, proceed to login',
    data: uploadUserProfile,
  });
});
export const loginService = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({
    email: new RegExp(`^${email}$`, 'i'),
  });

  console.log(user!.email, user!._id);
  if (!user) next(new AppError({ message: 'Invalid email', httpCode: HttpCode.UNAUTHORIZED }));

  const checkPassword = await user!.comparePassword(password);
  if (!checkPassword)
    next(
      new AppError({
        message: 'Invalid email',
        httpCode: HttpCode.UNAUTHORIZED,
      })
    );

  let token = await TokenModel.findOne({ userId: user!._id });

  if (!token) {
    token = new TokenModel({ userId: user!._id });
    token = await token.save();
  }

  // Generate access and refresh token
  const generatedAccessToken = await token!.generateToken(
    { userId: user!._id },
    environmentVariable.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: environmentVariable.ACCESS_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentVariable.JWT_ISSUER,
      audience: String(user!._id),
    }
  );
  const generatedRefreshToken = await token!.generateToken(
    { userId: user!._id },
    environmentVariable.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: environmentVariable.REFRESH_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentVariable.JWT_ISSUER,
      audience: String(user!._id),
    }
  );

  //save the updated token
  token.refreshToken = generatedRefreshToken;
  token.accessToken = generatedAccessToken;
  token = await token.save();

  // check if user verified
  if (!user!.isVerified || user!.status !== 'active') {
    const verifyEmailLink = `${environmentVariable.WEBSITE_URL}/verify-email?id=${user!._id}&token=${
      token.refreshToken
    }`;

    // // send email for verification
    const verifyingUser = {
      email: user!.email,
      id: user!._id,
      status: user!.status,
      link: verifyEmailLink,
    };
    await verifyUserEmail(verifyingUser).then(() => console.log(`Email has been sent to${user!.email}`));

    const data = {
      user: {
        accessToken: token!.accessToken,
        refreshToken: token!.refreshToken,
      },
    };

    return res.status(401).json({
      message: 'Your account is not verified, a verification code has been sent to your email',
      data,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, confirmPassword, isVerified, isDeleted, status, ...otherUserInfo } = user!._doc;

  const data = {
    accessToken: token!.accessToken,
    refreshToken: token!.refreshToken,
    user: otherUserInfo,
  };

  // set cookies
  res.cookie('accessToken', token!.accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // a day
    secure: process.env.NODE_ENV === 'production',
  });

  res.cookie('refreshToken', token!.refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(200).json({
    message: 'Success',
    data,
  });
});

export const getUserProfileService = asyncHandler(
  async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req!.user!._id);

    if (!user) next(new AppError({ message: 'You are not authorized', httpCode: HttpCode.UNAUTHORIZED }));

    const { password: pass, confirmPassword, isVerified, isDeleted, status, role, ...otherUserInfo } = user!._doc;

    return res.status(200).json({
      message: 'Success',
      data: otherUserInfo,
    });
  }
);

export const updateUserProfile = asyncHandler(
  async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
    const {
      email,
      firstName,
      lastName,
      gender,
      mobileNumber,
      address,
      dateOfBirth,
      how_did_you_find_us,
      educational_level,
      country_of_residence,
      state_of_residence,
      computer_skill_level,
      do_you_have_access_to_laptop,
      have_you_taken_any_tech_training,
      profileImage,
    } = req.body;

    const user = await UserModel.findById(req.params.userId);
    if (!user) next(new AppError({ message: 'Failed', httpCode: HttpCode.BAD_REQUEST }));

    if (!req.user!._id.equals(user!._id))
      next(new AppError({ message: 'You are unauthorized', httpCode: HttpCode.UNAUTHORIZED }));

    if (email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser && !existingUser!._id.equals(user!._id))
        next(
          new AppError({
            message: `E-Mail address ${email} is already exists, please pick a different one.`,
            httpCode: HttpCode.UNAUTHORIZED,
          })
        );
    }

    user!.firstName = firstName || user!.firstName;
    user!.lastName = lastName || user!.lastName;
    user!.gender = gender || user!.gender;
    user!.dateOfBirth = dateOfBirth || user!.dateOfBirth;
    user!.mobileNumber = mobileNumber || user!.mobileNumber;
    user!.address = address || user!.address;
    user!.how_did_you_find_us = how_did_you_find_us;
    user!.educational_level = educational_level;
    user!.country_of_residence = country_of_residence;
    user!.state_of_residence = state_of_residence;
    user!.computer_skill_level = computer_skill_level;
    user!.do_you_have_access_to_laptop = do_you_have_access_to_laptop;
    user!.have_you_taken_any_tech_training = have_you_taken_any_tech_training;
    // user!.profileImage = req.file!.path
    //   ? user!.profileImage
    //   : firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();

    const updatedUser = await user?.save({ validateBeforeSave: false });

    if (!updatedUser) next(new AppError({ message: 'Update failed', httpCode: HttpCode.UNPROCESSABLE_IDENTITY }));

    const { password: pass, confirmPasword, isVerified, isDeleted, status, role, ...otherUserInfo } = updatedUser!._doc;

    return res.status(200).json({
      message: 'Successfully updated',
      data: { user: otherUserInfo },
    });
  }
);

export const removeUserService = asyncHandler(
  async (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req.params.userId);
    if (!user) next(new AppError({ message: 'Failed', httpCode: HttpCode.BAD_REQUEST }));

    if (!req.user!._id.equals(user!._id) && req.user!.role !== 'admin')
      next(new AppError({ message: 'You are unauthorized', httpCode: HttpCode.UNAUTHORIZED }));

    //Delete user from DB
    const deleteUser = await UserModel.findByIdAndRemove({
      _id: req.params!.userId,
    });

    const deleteUserToken = await TokenModel.findOneAndDelete({ userId: user!._id });

    if (!deleteUser && !deleteUserToken)
      next(new AppError({ message: 'Failed to delete', httpCode: HttpCode.UNPROCESSABLE_IDENTITY }));
    return res.status(200).json({
      message: 'Successfully deleted',
    });
  }
);
export const logOutService: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  const token = await TokenModel.findOne({ refreshToken });
  if (!token) next(new AppError({ message: 'Failed', httpCode: HttpCode.BAD_REQUEST }));

  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) next(new AppError({ message: 'Failed', httpCode: HttpCode.BAD_REQUEST }));

  // Clear the refresh token
  await TokenModel.deleteOne({ refreshToken });

  // Clear the cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json({
    message: 'Successfully logged out',
  });
});

export const forgotPasswordService: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      const message = `The email address ${email} is not associated with any account. Double-check your email address and try again.`;
      next(new AppError({ message: message, httpCode: HttpCode.UNAUTHORIZED }));
    }

    let token = await TokenModel.findOne({ userId: user!._id });

    if (!token) {
      token = new TokenModel({ userId: user!._id });
      token = await token.save();
    }

    const generatedAccessToken = await token!.generateToken(
      {
        userId: user!._id,
      },
      environmentVariable.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentVariable.ACCESS_TOKEN_KEY_EXPIRE_TIME,
        issuer: environmentVariable.JWT_ISSUER,
        audience: String(user!._id),
      }
    );

    const generatedRefreshToken = await token!.generateToken(
      {
        userId: user!._id,
      },
      environmentVariable.REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: environmentVariable.RESET_PASSWORD_EXPIRE_TIME,
        issuer: environmentVariable.JWT_ISSUER,
        audience: String(user!._id),
      }
    );

    // Save Updated token
    token!.refreshToken = generatedRefreshToken;
    token!.accessToken = generatedAccessToken;

    token = await token!.save();

    const passwordResetLink = `${environmentVariable.WEBSITE_URL}/forgot-password/${user!._id}/${token.refreshToken}`;

    const resetUserPassword = {
      email: user!.email,
      id: user!._id,
      status: user!.status,
      link: passwordResetLink,
    };

    // Password reset email
    await sendResetPasswordEmail(resetUserPassword);

    const data = {
      passwordResetToken: resetUserPassword,
    };

    return res.status(200).json({
      message: `An Email with Reset password link has been sent to your account ${email}  please check to reset your password or use the the link which is been send with the response body to reset your password`,
      data,
    });
  }
);

export const resetPasswordService: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req!.params!.userId);
    if (!user)
      next(
        new AppError({ message: 'Password reset token is invalid or has expired', httpCode: HttpCode.UNAUTHORIZED })
      );

    const token = await TokenModel.findOne({
      userId: req!.params!.userId,
      refreshToken: req!.params!.token,
    });

    if (!token)
      next(
        new AppError({ message: 'Password reset token is invalid or has expired', httpCode: HttpCode.UNAUTHORIZED })
      );

    const userId = await verifyRefreshToken(req.params.token);
    if (!userId) next(new AppError({ message: 'Failed', httpCode: HttpCode.BAD_REQUEST }));

    user!.password = req.body.password;
    user!.confirmPassword = req.body.confirmPassword;
    await user?.save();
    await token?.delete();

    const confirmResetPasswordEmailLink = `${environmentVariable.WEBSITE_URL}/login`;

    const confirmResetPasswordLink = {
      email: user!.email,
      id: user!._id,
      status: user!.status,
      link: confirmResetPasswordEmailLink,
    };
    await sendConfirmResetPasswordEmail(confirmResetPasswordLink);

    const data = {
      loginLink: confirmResetPasswordLink,
    };

    return res.status(200).json({
      message: `Your password has been Password Reset Successfully updated please login`,
      data,
    });
  }
);

export const refreshTokenService: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    let token = await TokenModel.findOne({ refreshToken });

    if (!token)
      next(
        new AppError({
          message: 'Token not found',
          httpCode: HttpCode.NOT_FOUND,
        })
      );

    const userId = await verifyRefreshToken(refreshToken);
    if (!userId)
      next(
        new AppError({
          message: 'User not found',
          httpCode: HttpCode.NOT_FOUND,
        })
      );

    const generatedAccessToken = await token?.generateToken({ userId }, environmentVariable.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: environmentVariable.ACCESS_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentVariable.JWT_ISSUER,
      audience: String(userId),
    });
    const generatedRefreshToken = await token?.generateToken({ userId }, environmentVariable.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: environmentVariable.REFRESH_TOKEN_KEY_EXPIRE_TIME,
      issuer: environmentVariable.JWT_ISSUER,
      audience: String(userId),
    });

    //save updated token
    token!.refreshToken = generatedRefreshToken;
    token!.accessToken = generatedAccessToken;
    token = await token!.save();

    const data = {
      user: {
        accessToken: token!.accessToken,
        refreshToken: token!.refreshToken,
      },
    };

    //Set Cookies
    res.cookie('accessToken', token!.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV !== 'production',
    });

    res.cookie('refreshToken', token!.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV !== 'production',
    });
  }
);
