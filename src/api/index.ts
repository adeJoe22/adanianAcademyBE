import { Router } from 'express';

import homeRoute from './../routes/home.route';
import authRoutes from './../routes/auth.route';
import googleRoute from './../routes/google.route';
import adminRouter from '../routes/admin.routes';
const router = Router();

router.use('/', homeRoute);
router.use('/auth', authRoutes);
router.use('/auth', googleRoute);
router.use('/admin', adminRouter);

export default router;
