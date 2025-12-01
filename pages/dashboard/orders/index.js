import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!session?.user?.email) return;

    fetch(`/api/orders/user?email=${session.user.email}`)
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }, [session]);

  return (
    <div className="p-6">
      <h1>Your Orders</h1>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map(order => (
        <div key={order.id} className="border p-4 my-2 rounded">
          <p><b>Order ID:</b> {order.id}</p>
          <p><b>Amount:</b> ₦{order.amount}</p>
          <p><b>Status:</b> {order.status}</p>

          <a
            href={`/api/receipt/pdf?id=${order.id}`}
            className="text-blue-500 underline"
          >
            Download PDF
          </a>

          <br />

          <a
            href={`/api/receipt/excel?id=${order.id}`}
            className="text-green-600 underline"
          >
            Download Excel
          </a>
        </div>
      ))}
    </div>
  );
}
