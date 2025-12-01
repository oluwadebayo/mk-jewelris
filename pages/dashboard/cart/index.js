// pages/dashboard/cart/index.js
import { useEffect, useState, useRef } from "react";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import { getCart, removeFromCart, clearCart, saveCart } from "@/utils/cart";
import { useSession } from "next-auth/react";
import { showToast, showUndoToast } from "../../../components/ToastContainer";

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const lastRemovedItem = useRef(null);

  // LOAD CART
  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getCart();
      if (!mounted) return;
      setCart(c);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function refreshCart() {
    const c = await getCart();
    setCart(c);
    window.dispatchEvent(new Event("cart-updated"));
  }

  // -------------------------
  // ANIMATION HELPERS
  // -------------------------
  const animateRemove = (id) => {
    const el = document.getElementById(`cart-item-${id}`);
    if (!el) return;

    el.style.transition = "all 0.35s ease";
    el.style.transform = "translateX(-30px)";
    el.style.opacity = "0";
  };

  const animateRestore = (id) => {
    const el = document.getElementById(`cart-item-${id}`);
    if (!el) return;

    el.style.transition = "all 0.35s ease";
    el.style.transform = "scale(1.05)";
    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 250);
  };

  const animateQty = (id) => {
    const el = document.getElementById(`qty-${id}`);
    if (!el) return;

    el.style.transition = "transform 0.25s ease";
    el.style.transform = "scale(1.2)";
    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 200);
  };

  // -------------------------
  // QUANTITY UPDATE
  // -------------------------
  const increaseQty = async (id) => {
    animateQty(id);

    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );

    await saveCart(updated);
    setCart(updated);
  };

  const decreaseQty = async (id) => {
    animateQty(id);

    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
        : item
    );

    await saveCart(updated);
    setCart(updated);
  };

  const safeCart = Array.isArray(cart) ? cart : [];

  const total = safeCart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  // -------------------------
  // UNDO REMOVE
  // -------------------------
  const undoRemove = async () => {
    const removed = lastRemovedItem.current;
    if (!removed) return;

    const current = await getCart();
    const restoredCart = [...current, removed];
    await saveCart(restoredCart);

    const restoredId = removed.id;
    lastRemovedItem.current = null;

    await refreshCart();

    if (restoredId) {
      setTimeout(() => animateRestore(restoredId), 60);
    }

    showToast("Item restored!", "success");
  };

  // -------------------------
  // REMOVE ITEM
  // -------------------------
  const handleRemove = (item) => {
    animateRemove(item.id);

    setTimeout(async () => {
      lastRemovedItem.current = item;

      await removeFromCart(item.id);
      await refreshCart();

      showUndoToast("Item removed", undoRemove);
    }, 350);
  };

  // -------------------------
  // PAYSTACK CHECKOUT (SAFE)
  // -------------------------
  const handleCheckout = async () => {
    if (safeCart.length === 0) return showToast("Your cart is empty!", "error");

    const email = session?.user?.email;
    const reference = `REF-${Date.now()}`;

    try {
      // SAVE ORDER FIRST
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: total,
          reference,
          cart: safeCart,
        }),
      });

      const data = await res.json();

      if (!data.order) {
        return showToast("Order creation failed", "error");
      }

      // INITIALIZE PAYSTACK THROUGH BACKEND
      const initRes = await fetch("/api/paystack/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: total,
          reference,
          cart: safeCart,
        }),
      });

      const initData = await initRes.json();

      if (initData?.authorization_url) {
        window.location.href = initData.authorization_url;
      } else {
        showToast("Payment initialization failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Payment error", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div style={{ padding: "40px" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            color: "#0f766e",
            marginBottom: "20px",
          }}
        >
          Shopping Cart
        </h1>

        {safeCart.length === 0 ? (
          <p style={{ fontSize: "18px", color: "#555" }}>
            Your cart is empty.
          </p>
        ) : (
          <div>
            {safeCart.map((item) => (
              <div
                key={item.id}
                id={`cart-item-${item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px",
                  background: "white",
                  borderRadius: "10px",
                  marginBottom: "15px",
                  border: "1px solid #ddd",
                  opacity: 0,
                  transform: "translateY(15px)",
                  transition: "all 0.4s ease",
                }}
                onLoad={() => {
                  const el = document.getElementById(`cart-item-${item.id}`);
                  setTimeout(() => {
                    if (el) {
                      el.style.opacity = "1";
                      el.style.transform = "translateY(0)";
                    }
                  }, 50);
                }}
              >
                {/* LEFT: Image + name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
                      {item.name}
                    </h2>
                    <p style={{ fontSize: "16px", color: "#0f766e" }}>
                      ₦{item.price.toLocaleString()}
                    </p>

                    {/* QUANTITY BUTTONS */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "8px",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() => decreaseQty(item.id)}
                        style={{
                          padding: "5px 10px",
                          background: "#ddd",
                          borderRadius: "5px",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        -
                      </button>

                      <span
                        id={`qty-${item.id}`}
                        style={{ fontSize: "16px", fontWeight: "600" }}
                      >
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        style={{
                          padding: "5px 10px",
                          background: "#0f766e",
                          color: "white",
                          borderRadius: "5px",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* REMOVE BUTTON */}
                <button
                  onClick={() => handleRemove(item)}
                  style={{
                    background: "red",
                    color: "white",
                    padding: "8px 15px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* CART TOTAL */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                marginTop: "20px",
                color: "#0f766e",
              }}
            >
              Total: ₦{total.toLocaleString()}
            </h2>

            {/* CLEAR CART */}
            <button
              onClick={async () => {
                await clearCart();
                await refreshCart();
                showToast("Cart cleared", "warning");
              }}
              style={{
                marginTop: "20px",
                background: "#dc2626",
                color: "white",
                padding: "12px 25px",
                borderRadius: "8px",
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                marginRight: "20px",
              }}
            >
              Clear Cart
            </button>

            {/* PAYSTACK CHECKOUT */}
            <button
              onClick={handleCheckout}
              style={{
                marginTop: "20px",
                background: "#0f766e",
                color: "white",
                padding: "12px 25px",
                borderRadius: "8px",
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
