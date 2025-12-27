import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  register,
  login,
  logout,
  sendResetPassOtp,
  resetPassword,
  sendVerificationOtp,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/register", register);
router.post("/send-verification-otp", sendVerificationOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-reset-password-otp", sendResetPassOtp);
router.post("/reset-password", resetPassword);

router.get("/me", authMiddleware, (req, res) => {
  if (req?.user) {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
});

export default router;
