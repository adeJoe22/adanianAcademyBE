import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import { authRoles } from './../../../constants/auth';

const vaildObjectId = JoiObjectId(Joi);

export const userSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
  createUserProfile: Joi.object({
    userId: vaildObjectId().required(),
    role: Joi.string().valid(authRoles.admin, authRoles.user, authRoles.superAdmin),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email(),
    address: Joi.string().required(),
    dateOfBirth: Joi.string().required(),
    mobileNumber: Joi.string().required(),
    gender: Joi.string().required(),
    how_did_you_find_us: Joi.string().required(),
    country_of_residence: Joi.string().required(),
    state_of_residence: Joi.string().required(),
    computer_skill_level: Joi.string().required(),
    do_you_have_access_to_laptop: Joi.boolean().required(),
    have_you_taken_any_tech_training: Joi.boolean().required(),
    educational_level: Joi.string().required(),
    profileImage: Joi.string(),
    isVerified: Joi.boolean(),
    isDeleted: Joi.boolean(),
    filename: Joi.string().label('Invalid request (Please upload Image)'),
  }),
  updateUser: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    address: Joi.string(),
    dateOfBirth: Joi.string(),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    how_did_you_find_us: Joi.string(),
    country_of_residence: Joi.string(),
    state_of_residence: Joi.string(),
    computer_skill_level: Joi.string(),
    do_you_have_access_to_laptop: Joi.boolean(),
    have_you_taken_any_tech_training: Joi.boolean(),
    educational_level: Joi.string(),
    profileImage: Joi.string(),
    isVerified: Joi.boolean(),
    isDeleted: Joi.boolean(),
    filename: Joi.string().label('Invalid request (Please upload Image)'),
  }),
  verifyUserMail: Joi.object({
    token: Joi.string().min(3).required(),
    userId: vaildObjectId().required(),
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().min(3).required(),
  }),
  sendVerificationMail: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().min(3).max(300).required(),
    userId: vaildObjectId().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  }),
  validatedUserId: Joi.object({
    userId: vaildObjectId().required(),
  }),
};
