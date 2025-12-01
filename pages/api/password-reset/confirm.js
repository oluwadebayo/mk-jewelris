// pages/api/password-reset/confirm.js
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const usersFile = path.join(process.cwd(), "users.json");

function readUsers() {
  try {
    const raw = fs.existsSync(usersFile) ? fs.readFileSync(usersFile, "utf8") : "[]";
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("readUsers error:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("writeUsers error:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: "MISSING_FIELDS" });
  if (typeof password !== "string" || password.length < 6) return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });

  const users = readUsers();
  const user = users.find(u => u.resetToken === token);

  if (!user) return res.status(400).json({ error: "INVALID_TOKEN" });
  if (!user.resetExpires || Date.now() > user.resetExpires) return res.status(400).json({ error: "TOKEN_EXPIRED" });

  // update password (hash)
  const hashed = bcrypt.hashSync(password, 10);
  user.passwordHash = hashed;

  // clear reset fields
  delete user.resetToken;
  delete user.resetExpires;

  writeUsers(users);

  return res.status(200).json({ message: "Password updated" });
}
