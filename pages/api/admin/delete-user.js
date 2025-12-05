// pages/api/admin/delete-user.js
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

    let users = JSON.parse(raw || "[]");

    users = users.filter((u) => String(u.id) !== String(id));

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("delete-user error:", err);
    return res.status(500).json({ error: "DELETE_FAILED" });
  }
}
