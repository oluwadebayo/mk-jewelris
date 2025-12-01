import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-left">
        <Image
          src="/mylogo0.jpg"
          alt="M&K Jewelris Logo"
          width={45}
          height={45}
          priority
        />
      </div>

      <div className="nav-right">
        <Link href="/login" className="login-btn">Login</Link>
      </div>
    </nav>
  )
}
