import express, { Application, Request, Response, NextFunction } from 'express';
import { AppError, HttpCode } from './utils';
import { errorHandler } from './middlewares/error/errorHandler';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import crypto from 'crypto';
import api from './api';
import cookieParser from 'cookie-parser';

// const kw = crypto.randomBytes(32).toString("hex");
// console.log(kw);

// const hex = crypto
//   .randomBytes(Math.ceil(6 / 2))
//   .toString("hex")
//   .slice(0, 6);
// const auth_code = parseInt(hex, 16);
// console.log(auth_code);

const appConfig = (app: Application) => {
  app
    .use(express.json())
    .use(morgan('dev'))
    .use(helmet())
    .use(cors())
    .use(express.urlencoded({ extended: true }))
    .use(cookieParser())

    .use('/api-von/v1/', api)
    // catch wrong routes
    .all('*', (req: Request, res: Response, next: NextFunction) => {
      next(
        new AppError({
          message: `This route ${req.originalUrl} does not exist`,
          httpCode: HttpCode.NOT_FOUND,
        })
      );
    })

    // error middleware
    .use(errorHandler);
};

export default appConfig;
