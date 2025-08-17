import Razorpay from "razorpay";
import dotenv from "dotenv"


dotenv.config()


export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // should be a valid string
  key_secret: process.env.RAZORPAY_KEY_SECRET // should be a valid string
});