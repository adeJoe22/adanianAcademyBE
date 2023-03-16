import { Document, Schema } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  role?: string;
  status?: string;
  profileImage?: string;
  mobileNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  how_did_you_find_us?: string;
  educational_level?: string;
  country_of_residence?: string;
  state_of_residence?: string;
  computer_skill_level?: string;
  do_you_have_access_to_laptop?: boolean;
  have_you_taken_any_tech_training?: boolean;
  userId?: Schema.Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  emailVerificationLinkToken?: string;
  cloudinary_id?: string;
  _doc?: any;
}

export interface IRequestUser extends Request {
  user: IUser;
}

export interface IAuthRequest extends Request {
  headers: { authorization?: string; Authorization?: string };
  cookies: { authToken?: string; accessToken?: string; refreshToken?: string };
  user?: IUser;
}
