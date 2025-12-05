import 'dotenv/config';
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// -----------------------------
// Convert any string/number to UUID
// -----------------------------
function toUUID(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex").slice(0, 32)
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

// -----------------------------
// Load JSON safely
// -----------------------------
function loadJSON(file) {
  const p = path.join(process.cwd(), "public", file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8") || "[]");
}

// -----------------------------
// Setup Supabase Admin Client
// -----------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map for converting old IDs → new UUIDs
const uuidMap = { users: {}, products: {}, orders: {} };

// --------------------------------------------
// USERS
// --------------------------------------------
async function importUsers() {
  const users = loadJSON("users.json");
  console.log(`Found ${users.length} users…`);

  for (const u of users) {
    const newId = toUUID(u.id);

    uuidMap.users[u.id] = newId;

    const row = {
      id: newId,
      email: u.email,
      password_hash: u.password_hash || null,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      role: u.role || "user",
      verified: !!u.verified
    };

    const { error } = await supabase.from("users").upsert(row);

    if (error) console.log("❌ User import error:", u.email, error.message);
  }

  console.log("✔️ Users imported.");
}

// --------------------------------------------
// PRODUCTS
// --------------------------------------------
async function importProducts() {
  const products = loadJSON("products.json");
  console.log(`Found ${products.length} products…`);

  for (const p of products) {
    const newId = toUUID(p.id);
    uuidMap.products[p.id] = newId;

    const row = {
      id: newId,
      name: p.name || "",
      price: p.price || 0,
      description: p.description || null,
      image: p.image || null,
      created_at: p.createdAt || null
    };

    const { error } = await supabase.from("products").upsert(row);

    if (error) console.log("❌ Product import error:", p.id, error.message);
  }

  console.log("✔️ Products imported.");
}

// --------------------------------------------
// ORDERS
// --------------------------------------------
async function importOrders() {
  const orders = loadJSON("orders.json");
  console.log(`Found ${orders.length} orders…`);

  for (const o of orders) {
    const newId = toUUID(o.id);
    uuidMap.orders[o.id] = newId;

    // convert id references inside cart to new UUIDs
    const newCart = Array.isArray(o.cart)
      ? o.cart.map(item => ({
          ...item,
          id: uuidMap.products[item.id] || toUUID(item.id)
        }))
      : [];

    const row = {
      id: newId,
      user_id: uuidMap.users[o.user_id] || toUUID(o.user_id),
      cart: newCart,
      total: o.total || 0,
      status: o.status || "pending",
      created_at: o.createdAt || null
    };

    const { error } = await supabase.from("orders").upsert(row);

    if (error) console.log("❌ Order import error:", o.id, error.message);
  }

  console.log("✔️ Orders imported.");
}

// --------------------------------------------
// RUN
// --------------------------------------------
async function run() {
  console.log("🚀 Import started");

  await importUsers();
  await importProducts();
  await importOrders();

  // Save map file
  fs.writeFileSync("uuid_map.json", JSON.stringify(uuidMap, null, 2));

  console.log("🎉 All done! UUID map saved → uuid_map.json");
  process.exit();
}

run();
