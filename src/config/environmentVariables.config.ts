import dotenv from 'dotenv';
dotenv.config();

export const environmentVariable = {
  DB: process.env.MONGODB_LOCALHOST as string,
  PORT: process.env.PORT as string,
  TOKEN_SECRET: process.env.TOKEN_SECRET as string,
  JWT_EXPIRES: process.env.JWT_EXPIRES as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as string,
  ACCESS_TOKEN_SECRET_KEY: process.env.ACCESS_TOKEN_SECRET_KEY as string,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY as string,
  ACCESS_TOKEN_KEY_EXPIRE_TIME: process.env.ACCESS_TOKEN_KEY_EXPIRE_TIME as string,
  REFRESH_TOKEN_KEY_EXPIRE_TIME: process.env.REFRESH_TOKEN_KEY_EXPIRE_TIME as string,
  JWT_ISSUER: process.env.JWT_ISSUER as string,
  WEBSITE_URL: process.env.WEBSITE_URL as string,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET as string,
  GOOGLE_ID: process.env.GOOGLE_ID as string,

  GOOGLE_REFRESHTOKEN: process.env.GOOGLE_REFRESHTOKEN as string,
  GOOGLE_REDIRECT: process.env.GOOGLE_REDIRECT as string,
  RESET_PASSWORD_EXPIRE_TIME: process.env.RESET_PASSWORD_EXPIRE_TIME as string,
  PASSPORT_GOOGLE_CLIENT_ID: process.env.PASSPORT_GOOGLE_CLIENT_ID as string,
  PASSPORT_GOOGLE_CLIENT_SECRET: process.env.PASSPORT_GOOGLE_CLIENT_SECRET as string,
  SESSION_KEY: process.env.SESSION_KEY as string,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
};

export default environmentVariable;
