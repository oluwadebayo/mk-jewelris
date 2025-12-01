import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "users.json");

export default function handler(req, res) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id } = req.query;
    const updated = req.body;

    const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "[]";
    let users = JSON.parse(raw);

    users = users.map((u) =>
      String(u.id) === String(id) ? { ...u, ...updated } : u
    );

    fs.writeFileSync(file, JSON.stringify(users, null, 2));

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "UPDATE_FAILED" });
  }
}
