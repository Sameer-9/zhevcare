import { Router } from "express";
import { history, insertPrescription, report, updateProfile } from "../controllers/report";
import { authMiddleware } from "../middleware/auth";

export const reportRouter = Router();

//! Report routes
reportRouter.get("/history", history);
reportRouter.get("/report", authMiddleware, report);
reportRouter.get("/prescription", authMiddleware, insertPrescription);

//! User routes
reportRouter.get("/update-profile", authMiddleware, updateProfile);
