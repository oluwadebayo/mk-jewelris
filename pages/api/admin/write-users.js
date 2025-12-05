// pages/api/admin/write-users.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const dataDir = path.join(process.cwd(), "public");
    const filePath = path.join(dataDir, "users.json");

    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("WRITE ERROR:", err);
    return res.status(500).json({ error: "WRITE_FAILED" });
  }
}
