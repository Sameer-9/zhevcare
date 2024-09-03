import { Router } from "express";
import { history, insertPrescription, report, updateProfile } from "../controllers/report.js";
import { authMiddleware } from "../middleware/auth.js";

export const reportRouter = Router();

//! Report routes
reportRouter.get("/history", history);
reportRouter.get("/report", authMiddleware, report);
reportRouter.get("/prescription", authMiddleware, insertPrescription);

//! User routes
reportRouter.get("/update-profile", authMiddleware, updateProfile);
