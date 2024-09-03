import { Router } from "express";
import { history, insertPrescription, report, updateProfile } from "../controllers/report.js";
import { authMiddleware } from "../middleware/auth.js";

export const reportRouter = Router();

//! Report routes
reportRouter.get("/history", authMiddleware, history);
reportRouter.get("/report", authMiddleware, report);
reportRouter.post("/prescription", authMiddleware, insertPrescription);

//! User routes
reportRouter.post("/update-profile", authMiddleware, updateProfile);
