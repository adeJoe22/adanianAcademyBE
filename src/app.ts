import express, { Application, Request, Response, NextFunction, Router } from 'express';
import { AppError, HttpCode } from './utils';
import { errorHandler } from './middlewares/error/errorHandler';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import api from './api';
import cookieSession from 'cookie-session';
import passport from 'passport';
import { googleSessionMiddleware, sessionOptions } from './services/google.service';
import cookieParser from 'cookie-parser';

const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback;
    if (allowedOrigins.indexOf(origin) === -1) {
      let msg = `The CORS policy for this site does not allow access from the specified origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  },
  credentials: true,
};

const appConfig = (app: Application) => {
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    })
    .use(cors({ origin: true, credentials: true }))
    .use(morgan('dev'))
    .use(
      helmet({
        crossOriginResourcePolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
      })
    )

    .use(cookieParser())
    .use(cookieSession(sessionOptions))
    .use(googleSessionMiddleware)
    .use(passport.initialize())
    .use(passport.session())

    .use('/api-von/v1/', api)

    // catch 404 routes
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
