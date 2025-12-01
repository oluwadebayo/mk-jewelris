import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "users.json");

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { firstName, lastName, email, password, role } = req.body;

    const raw = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "[]";
    const users = JSON.parse(raw);

    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      password,
      role,
      verified: true,
    };

    users.push(newUser);

    fs.writeFileSync(file, JSON.stringify(users, null, 2));

    return res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    return res.status(500).json({ error: "CREATE_FAILED" });
  }
}
