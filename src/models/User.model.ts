import { Schema, Document, model } from 'mongoose';
import { IUser } from '../interfaces';
import bcrypt from 'bcrypt';
import { authRoles } from '../constants/auth';
import jwt, { Secret } from 'jsonwebtoken';
import { environmentVariable } from '../config';

interface IUserDocument extends Document, IUser {
  // document level operations
  comparePassword(password: string): Promise<boolean>;
  createJwt(): Promise<void>;
}

const userSchema: Schema<IUserDocument> = new Schema(
  {
    firstName: {
      type: String,
      // required: [true, "Please provide name"],
    },
    lastName: {
      type: String,

      // required: [true, "Please provide surname"],
    },
    email: {
      type: String,
      // required: [true, "Please provide email"],
      // a regular expression to validate an email address(stackoverflow)
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: false,
      trim: true,
      lowercase: true,
      index: false,
    },
    password: {
      type: String,
      // required: [true, "Please provide password"],
      minlength: [6, 'Password must be more than 6 characters'],
      trim: true,
    },
    confirmPassword: {
      type: String,
      // required: [true, "Please provide confirmed Password"],
      minlength: [6, 'Password must be more than 6 characters'],
      trim: true,
    },
    studentId: { type: String, default: '' },
    role: {
      type: String,

      lowercase: true,
      enum: [authRoles.user, authRoles.admin, authRoles.superAdmin],
      default: authRoles.user,
    },
    dateOfBirth: {
      type: String,
      maxLength: 15,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: false,
      maxLength: [18, "mobileNumber can't be greater than 18 characters"],
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please provide a valid number'],
      trim: true,
    },
    how_did_you_find_us: {
      type: String,
    },
    educational_level: { type: String },
    country_of_residence: { type: String },
    state_of_residence: { type: String },
    computer_skill_level: { type: String },
    do_you_have_access_to_laptop: {
      type: Boolean,

      default: false,
    },
    have_you_taken_any_tech_training: { type: Boolean, default: false },
    isVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'pending',
      required: false,
      trim: true,
      lowercase: true,
    },
    gender: { type: String, trim: true, lowercase: true },
    profileImage: {
      type: String,
    },
    cloudinary_id: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
    },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// this is to encrypt the password
userSchema.pre('save', async function (next) {
  const user = this;
  console.log(`Data before save: ${JSON.stringify(user)}`);

  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    user.confirmPassword = user.password;
  }
  next();
});

// this is to compare passwords
userSchema.methods.comparePassword = async function (userPassword: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

// create JWT token
userSchema.methods.createJwt = function () {
  const payload = {
    userId: this._id,
    email: this.email,
    surname: this.surname,
    role: this.role,
  };

  return jwt.sign(payload, environmentVariable.TOKEN_SECRET as Secret, {
    expiresIn: environmentVariable.JWT_EXPIRES,
  });
};
const UserModel = model<IUserDocument>('User', userSchema);
export default UserModel;
