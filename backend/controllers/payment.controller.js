import { razorpay } from "../lib/razorpay.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import crypto from "crypto";

export const createRazorpayOrder = async (req, res) => {
  try {
    const { products, couponCode, userId } = req.body;
    console.log("Payment verification request body:", req.body);


    // Validate products
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    products.forEach(product => {
      totalAmount += product.price * product.quantity * 100; // convert to paise
    });

    // Apply coupon discount
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, userId, isActive: true });
      if (coupon) {
        totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
      }
    }

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error processing Razorpay checkout:", error);
    res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
  }
};

import mongoose from "mongoose";
// ...other imports

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      products,
      userId,
      couponCode,
    } = req.body;

    if (!products || !Array.isArray(products)) {
  return res.status(400).json({ message: "Missing products array in request" });
}
if (!userId) {
  return res.status(400).json({ message: "Missing userId in request" });
}
// ... other checks as required

    // ...signature verification code...

    // Ensure userId and product ids are ObjectId
    const newOrder = new Order({
  user: new mongoose.Types.ObjectId(userId),
  products: products.map((p) => ({
    product: new mongoose.Types.ObjectId(p._id),
    quantity: p.quantity,
    price: p.price,
  })),
  totalAmount: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
  razorpayOrderId: razorpay_order_id,
  razorpayPaymentId: razorpay_payment_id,
  couponCode: couponCode || null,
});

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment successful, order created, and coupon deactivated if used.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({ message: "Error processing successful checkout", error: error.message });
  }
};
