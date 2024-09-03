import { Router } from "express";
import { authenticate, forgotPassword, registerDoctor, registerPatient } from "../controllers/authenticate.js";

export const authRouter = Router();

authRouter.post("/register/patient", registerPatient);
authRouter.post("/register/doctor", registerDoctor);
authRouter.post("/login", authenticate);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/change-password", forgotPassword);