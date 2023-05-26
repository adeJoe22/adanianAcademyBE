import { NextFunction } from 'express';

import UserModel from '../../models/User.model';
import { IPaginationRequest, IPaginationResponse } from '../../interfaces';
import { authRoles } from '../../constants/auth';

export const usersPaginationMiddleware = () => {
  return async (req: IPaginationRequest, res: IPaginationResponse, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results: any = {
      currentPage: {
        page,
        limit,
      },
      totalDocs: 0,
    };

    const totalCount = await UserModel.countDocuments().exec();
    results.totalDocs = totalCount;

    if (endIndex < totalCount) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    results.totalPages = Math.ceil(totalCount / limit);
    results.lastPage = Math.ceil(totalCount / limit);

    // Sort

    const sort: any = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sort.toLowerCase() === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    //filter
    let filter: any = {};

    if (req.query.filterBy && req.query.role) {
      if (req.query.role.toLowerCase() === authRoles.admin) {
        filter.$or = [{ role: authRoles.admin }];
      } else if (req.query.role.toLowerCase() === authRoles.superAdmin) {
        filter.$or = [{ role: authRoles.superAdmin }];
      } else if (req.query.role.toLowerCase() === authRoles.user) {
        filter.$or = [{ role: authRoles.user }];
      } else {
        filter = {};
      }
    }

    //Search
    if (req.query.search) {
      filter = {
        $or: [
          { name: { $regex: req.query.search } },
          { email: { $regex: req.query.search } },
          { gender: { $regex: req.query.search } },
          { role: { $regex: req.query.search } },
        ],
      };
    }

    try {
      results.results = await UserModel.find(filter)
        .select(`firstName lastName email gender isVerified  profileImage  mobileNumber  status role`)
        .limit(limit)
        .sort(sort)
        .skip(startIndex)
        .exec();

      // Add pagination Results to the requeat
      res.paginatedResults = results;
      next();
    } catch (error: any) {
      return next(error);
    }
  };
};
