// utils/cart.js — CLIENT SAFE (NO FS!)
export async function getCart() {
  try {
    // frontend cart stored in localStorage
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("cart");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // fall through to fetch
        }
      }
    }

    // fallback if no localStorage (SSR or corrupted local)
    const res = await fetch("/api/cart/get");
    const data = await res.json();
    return Array.isArray(data.cart) ? data.cart : [];
  } catch {
    return [];
  }
}

export async function saveCart(cart) {
  // 1️⃣ Save to localStorage for instant UI updates
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // 2️⃣ Fire cart-updated event for Navbar counter
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }

  // 3️⃣ Sync to backend storage (JSON file)
  try {
    await fetch("/api/cart/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });
  } catch (err) {
    // non-fatal: backend sync failed
    console.warn("Failed to sync cart to server", err);
  }
}

export async function clearCart() {
  await saveCart([]); // uses the fixed saveCart()
}

export async function addToCart(item) {
  const cart = await getCart();
  cart.push(item);
  await saveCart(cart);
  return cart;
}

export async function removeFromCart(identifier) {
  // identifier can be id or predicate
  const current = await getCart();
  let updated;
  if (typeof identifier === "function") {
    updated = current.filter((it, i) => !identifier(it, i));
  } else {
    // assume id
    updated = current.filter((it) => String(it.id) !== String(identifier));
  }
  await saveCart(updated);
  return updated;
}
