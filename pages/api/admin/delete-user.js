// pages/api/admin/delete-user.js

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "MISSING_ID" });

    // Load users.json from public
    const usersRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/users.json`);
    let users = await usersRes.json();

    // Remove user
    users = users.filter((u) => String(u.id) !== String(id));

    // Write updated JSON
    const saveRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/write-users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(users),
    });

    if (!saveRes.ok) {
      return res.status(500).json({ error: "WRITE_FAILED" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("delete-user error:", err);
    return res.status(500).json({ error: "DELETE_FAILED" });
  }
}
