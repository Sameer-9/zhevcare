import { Router } from "express";
import { authRouter } from "./authenticate.js";
import { reportRouter } from "./report.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/", reportRouter);

export default router;
