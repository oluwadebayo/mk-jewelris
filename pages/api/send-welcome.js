// pages/api/send-welcome.js
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "MISSING_EMAIL" });

  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  const name = user.firstName || "";

  const frontendBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const html = `
    <div style="background-color:#0f1216; padding:40px 0; font-family:Arial, sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1d21; border-radius:8px; padding:40px;">
        <tr>
          <td align="center" style="padding-bottom:30px;">
            <img src="mylogo0.jpg" alt="Logo" width="140" style="display:block;">
          </td>
        </tr>

        <tr>
          <td style="color:white; font-size:22px; font-weight:bold; padding-bottom:20px;">
            Welcome to M&K Jewelris${name ? `, ${name}` : ""}
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:16px; line-height:24px; padding-bottom:30px;">
            Thank you for joining M&K Jewelris! We're excited to have you on board.
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-bottom:40px;">
            <a href="${frontendBase}" style="background:#bfc3cc; color:#000; padding:12px 22px; font-size:15px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
              Visit the store
            </a>
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:15px; line-height:24px; padding-bottom:30px;">
            If you need help, reply to this email. <br><br>
            Regards,<br>
            M&K Jewelris
          </td>
        </tr>
      </table>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      to: email,
      subject: "Welcome to M&K Jewelris",
      html
    });
  } catch (err) {
    console.error("send-welcome mail error:", err);
    // still return success so caller may not block because of mail issues
  }

  return res.status(200).json({ message: "Welcome email sent (if mail configured)" });
}
