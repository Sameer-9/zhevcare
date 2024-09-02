import { Router } from "express";
import { authenticate, registerDoctor, registerPatient } from "../controllers/authenticate.js";

export const authRouter = Router();

authRouter.post("/register/patient", registerPatient);
authRouter.post("/register/doctor", registerDoctor);
authRouter.post("/login", authenticate)