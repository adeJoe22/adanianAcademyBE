import { Router } from 'express';
import { isAuthorized } from '../middlewares/auth';
import { isAdmin } from '../middlewares/auth/isAdmin';
import { usersPaginationMiddleware } from '../middlewares/sort-filter-pagination/userFeatures';
import { adminGetUsersController, adminGetUserController } from '../controllers/admin.controller';

const adminRouter = Router();

adminRouter.get('/users', isAuthorized, isAdmin, usersPaginationMiddleware(), adminGetUsersController);

adminRouter.get('/users/:userId', isAuthorized, adminGetUserController);

export default adminRouter;
