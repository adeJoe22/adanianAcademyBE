import { IUser } from './User.interface';
import { Request, Response } from 'express';

export interface IPaginationRequest extends Request {
  query: {
    limit: string;
    page: string;
    sort: string;
    fields: string;
    role: string;
    search: string;
    sortBy: string;
    filterBy: string;
  };
}

export interface IPaginationResponse extends Response {
  paginatedResults?: {
    results: any;
    next: string;
    previous: string;
    currentPage: string;
    totalDocs: string;
    totalPages: string;
    lastPage: string;
  };
}
export interface IAuthRefreshTokenRequest extends Request {
  headers: { authorization?: string; Authorization?: string };
  cookies: { authToken?: string };
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthenticatedRequestBody<T> extends Request {
  body: T;
  user?: IUser;
}
