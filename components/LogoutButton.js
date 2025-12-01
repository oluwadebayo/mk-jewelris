import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button onClick={() => signOut()} className="logout-btn">
      Logout

      <style jsx>{`
        .logout-btn {
          padding: 10px 20px;
          background: #002330;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </button>
  )
}
