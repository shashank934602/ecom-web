import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link,useLocation } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";


const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { clearCart } = useCartStore();
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState("");
  const location = useLocation();

  useEffect(() => {
  const handleRazorpayVerification = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const razorpay_payment_id = params.get("razorpay_payment_id");
      const razorpay_order_id = params.get("razorpay_order_id");
      const razorpay_signature = params.get("razorpay_signature");

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        setError("Missing payment details in URL. Please contact support.");
        setIsProcessing(false);
        return;
      }

      // Load persisted cart info
      const savedCart = localStorage.getItem("lastCart");
      const savedUserId = localStorage.getItem("lastUserId");
      const savedCouponCode = localStorage.getItem("lastCouponCode");

      if (!savedCart || !savedUserId) {
        setError("Missing cart or user information.");
        setIsProcessing(false);
        return;
      }

      const products = JSON.parse(savedCart);
      const userId = savedUserId;
      const couponCode = savedCouponCode || null;

      const response = await axios.post("/payments/verify-razorpay-payment", {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        products,
        userId,
        couponCode,
      });

      if (response.data && response.data.success) {
        setOrderId(response.data.orderId || "");
        clearCart();
        // Clear localStorage since order is successful
        localStorage.removeItem("lastCart");
        localStorage.removeItem("lastUserId");
        localStorage.removeItem("lastCouponCode");
      } else {
        setError("Could not verify payment. Please contact support.");
      }
    } catch (error) {
      setError("Payment verification failed.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  handleRazorpayVerification();
}, [location.search, clearCart]);


  // ...rest of your component JSX...
  return (
		<div className='h-screen flex items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
						Purchase Successful!
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className='text-emerald-400 text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>
					<div className='bg-gray-700 rounded-lg p-4 mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Order number</span>
							<span className='text-sm font-semibold text-emerald-400'>
  {orderId ? `#${orderId}` : "---"}
</span>

						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-400'>Estimated delivery</span>
							<span className='text-sm font-semibold text-emerald-400'>3-5 business days</span>
						</div>
					</div>

					<div className='space-y-4'>
						<button
							className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PurchaseSuccessPage;
