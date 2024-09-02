import { Router } from "express";
import { history, report } from "../controllers/report";
import { authMiddleware } from "../middleware/auth";

export const reportRouter = Router();

reportRouter.get("/history", history);
reportRouter.get("/report", authMiddleware, report);
