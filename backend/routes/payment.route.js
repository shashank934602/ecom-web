import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-razorpay-order", protectRoute, createRazorpayOrder);
router.post("/verify-razorpay-payment", protectRoute, verifyRazorpayPayment);

export default router;
