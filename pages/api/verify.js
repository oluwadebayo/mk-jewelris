// pages/api/verify.js
import fs from "fs";
import path from "path";
import { serialize } from "cookie";
import { v4 as uuid } from "uuid";

const usersPath = path.join(process.cwd(), "users.json");
const sessionsPath = path.join(process.cwd(), "sessions.json");

export default function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "MISSING_TOKEN" });
  }

  // SAFELY read users
  let users = [];
  try {
    const raw = fs.existsSync(usersPath) ? fs.readFileSync(usersPath, "utf8") : "[]";
    users = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("read users error:", err);
    return res.status(500).json({ error: "READ_FAILED" });
  }

  const user = users.find(u => u.verifyToken === token);

  if (!user) {
    return res.status(400).json({ error: "INVALID_VERIFY_TOKEN" });
  }

  // check expiry if present
  if (user.verifyExpires && Date.now() > user.verifyExpires) {
    return res.status(400).json({ error: "VERIFY_TOKEN_EXPIRED" });
  }

  // mark verified
  user.verified = true;
  user.verifyToken = null;
  user.verifyExpires = null;

  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("write users error:", err);
    return res.status(500).json({ error: "SAVE_FAILED" });
  }

  // create NextAuth-compatible session token stored in sessions.json (legacy approach you used)
  const sessionToken = uuid();
  let sessions = [];

  try {
    if (fs.existsSync(sessionsPath)) {
      const rawSessions = fs.readFileSync(sessionsPath, "utf8");
      sessions = JSON.parse(rawSessions || "[]");
    }
  } catch (err) {
    console.error("read sessions error:", err);
    sessions = [];
  }

  sessions.push({
    sessionToken,
    userId: user.id,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  try {
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error("write sessions error:", err);
    // continue anyway
  }

  // set cookie (matches your previous implementation)
  res.setHeader(
    "Set-Cookie",
    serialize("next-auth.session-token", sessionToken, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    })
  );

  return res.status(200).json({ success: true });
}
