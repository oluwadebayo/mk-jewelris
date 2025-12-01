// pages/payment/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PaymentSuccess() {
  const router = useRouter();
  const { reference } = router.query;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;

    async function verify() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Payment verification failed.");
          setLoading(false);
          return;
        }

        setOrder(data.order);
      } catch (err) {
        setError("Something went wrong verifying payment.");
      }

      setLoading(false);
    }

    verify();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-black rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white shadow p-6 rounded-lg text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600">Payment Failed</h1>
          <p className="mt-2 text-gray-700">{error}</p>

          <button
            onClick={() => router.push("/dashboard/cart")}
            className="mt-4 px-5 py-2 bg-black text-white rounded-md"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl w-full">

        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mt-4">Payment Successful 🎉</h1>
          <p className="text-gray-600 mt-1">Thank you for your order!</p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <p className="mt-2 text-gray-700">
            <strong>Reference:</strong> {order.reference}
          </p>

          <p className="text-gray-700 mt-1">
            <strong>Amount:</strong> ₦{order.amount?.toLocaleString()}
          </p>

          <h3 className="mt-4 font-semibold">Items:</h3>

          <ul className="mt-2 space-y-2">
            {order.cart?.map((item, index) => (
              <li
                key={index}
                className="border rounded-md p-3 flex justify-between"
              >
                <span>{item.name} × {item.quantity}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-3 bg-black text-white rounded-md w-full"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push("/")}
              className="mt-3 px-5 py-2 border border-black rounded-md w-full"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
