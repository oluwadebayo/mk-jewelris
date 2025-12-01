// pages/api/admin/users.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "users.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      const raw = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, "utf8")
        : "[]";

      const users = raw ? JSON.parse(raw) : [];

      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ error: "READ_FAILED" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
