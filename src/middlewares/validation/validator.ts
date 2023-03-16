import { NextFunction } from 'express';
import Joi from 'joi';
import { AppError, HttpCode } from '../../utils';

export const validator = (schemaName: Joi.ObjectSchema, body: object, next: NextFunction) => {
  const value = schemaName.validate(body, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: true,
  });

  try {
    value.error
      ? next(
          new AppError({
            httpCode: HttpCode.UNPROCESSABLE_IDENTITY,
            message: value.error.details[0].message,
          })
        )
      : next();
  } catch (error) {
    console.log(error);
  }
};

export default validator;
