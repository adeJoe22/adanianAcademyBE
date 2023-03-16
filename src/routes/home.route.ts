import { Request, Response, Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const message = `Welcome to VON - 🤑🧡💯✔🚀`;

  res.status(200).json({
    message,
  });
});

export default router;
