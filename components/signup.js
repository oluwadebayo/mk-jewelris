import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const usersFile = path.join(process.cwd(), "users.json")

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { firstName, lastName, company, email, password } = req.body

  const raw = fs.readFileSync(usersFile, "utf8") || "[]"
  const users = JSON.parse(raw)

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  const verifyToken = crypto.randomBytes(20).toString("hex")

  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    company,
    email,

    // ✔ SAFE login password
    passwordHash: hashedPassword,

    // ❗ Admin-visible password
    passwordPlain: password,

    verified: false,
    verifyToken
  }

  users.push(newUser)
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))

  console.log("Verify link:", `http://localhost:3001/api/verify?token=${verifyToken}`)

  return res.status(200).json({ message: "Account created! Check email." })
}

const [showResend, setShowResend] = useState(false)
const [pendingEmail, setPendingEmail] = useState("")
