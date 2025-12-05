// pages/api/admin/toggle-admin.js
import fs from "fs";
import path from "path";

const usersFile = path.join(process.cwd(), "public", "users.json");

export default function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "MISSING_ID" });

    const raw = fs.existsSync(usersFile)
      ? fs.readFileSync(usersFile, "utf8")
      : "[]";

    const users = JSON.parse(raw || "[]");

    const updated = users.map((u) =>
      String(u.id) === String(id)
        ? { ...u, role: u.role === "admin" ? "user" : "admin" }
        : u
    );

    fs.writeFileSync(usersFile, JSON.stringify(updated, null, 2));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("toggle-admin error:", err);
    return res.status(500).json({ error: "TOGGLE_FAILED" });
  }
}
