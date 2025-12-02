import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const { ref } = router.query;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!ref) return;

    async function getOrder() {
      try {
        const res = await fetch(`/api/orders/get?reference=${ref}`);
        const data = await res.json();

        if (res.ok) {
          setOrder(data.order);
        }

        setLoading(false);
      } catch (error) {
        console.error("Order fetch error:", error);
        setLoading(false);
      }
    }

    getOrder();
  }, [ref]);

  if (loading) {
    return (
      <div className="success-container">
        <div className="loader"></div>
        <h2>Fetching your order…</h2>

        <style jsx>{`
          .success-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .loader {
            width: 60px;
            height: 60px;
            border: 5px solid #ddd;
            border-top-color: #00c851;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="success-wrapper">
      <div className="success-card">
        <div className="checkmark">✔</div>

        <h1>Payment Successful</h1>

        <p>Your transaction reference:</p>
        <div className="ref-box">{ref}</div>

        {order && (
          <>
            <h3>Order Summary</h3>
            <div className="order-box">
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Total:</strong> ₦{order.amount}</p>
              <p><strong>Items:</strong> {order.cart?.length}</p>
            </div>
          </>
        )}

        <button onClick={() => router.push("/dashboard")}>Go to Dashboard</button>
      </div>

      <style jsx>{`
        .success-wrapper {
          display: flex;
          justify-content: center;
          padding: 40px;
        }
        .success-card {
          width: 100%;
          max-width: 480px;
          background: #fff;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .checkmark {
          font-size: 60px;
          color: #00c851;
          margin-bottom: 20px;
        }
        .ref-box {
          margin-top: 10px;
          padding: 10px;
          background: #f7f7f7;
          border-radius: 6px;
          font-size: 14px;
        }
        .order-box {
          margin-top: 10px;
          padding: 15px;
          background: #fafafa;
          border-radius: 10px;
          text-align: left;
        }
        button {
          margin-top: 20px;
          background: #00c851;
          color: #fff;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
