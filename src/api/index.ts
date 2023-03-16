import { Router } from "express";

import homeRoute from "./../routes/home.route";
import authRoutes from "./../routes/auth.route";

const router = Router();

router.use("/", homeRoute);
router.use("/auth", authRoutes);

export default router;
