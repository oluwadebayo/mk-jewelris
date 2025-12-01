// pages/api/products/upload.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) return res.status(400).json({ message: "Missing filename or base64" });

    // support "data:image/png;base64,..." or plain base64
    const raw = base64.includes("base64,") ? base64.split("base64,")[1] : base64;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(raw, "base64"));

    // return public URL
    return res.status(200).json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
}
