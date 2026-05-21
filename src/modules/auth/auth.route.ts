import { Router } from "express";
import { authController } from "./auth.controller.ts";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

export const authRoute = router;
