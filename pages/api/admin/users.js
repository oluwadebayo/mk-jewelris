// pages/api/admin/users.js

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Load public/users.json using absolute URL
    const usersRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/users.json`);

    if (!usersRes.ok) {
      console.error("Failed to fetch users.json:", await usersRes.text());
      return res.status(500).json({ error: "READ_FAILED" });
    }

    const users = await usersRes.json();

    return res.status(200).json({
      users: Array.isArray(users) ? users : [],
    });
  } catch (err) {
    console.error("API /admin/users error:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
