// pages/reset-success.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ResetSuccess() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Fade-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Confetti animation
  useEffect(() => {
    setTimeout(() => {
      launchConfetti();
    }, 200);
  }, []);

  // Auto redirect if not logged in
  useEffect(() => {
    if (!session) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  // Simple JS confetti
  function launchConfetti() {
    const duration = 1200;
    const end = Date.now() + duration;

    (function frame() {
      const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"];
      createParticle(colors[Math.floor(Math.random() * colors.length)]);
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function createParticle(color) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "8px";
    confetti.style.height = "8px";
    confetti.style.background = color;
    confetti.style.top = "-10px";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.opacity = "0.9";
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = "transform 1.2s ease-out, top 1.2s ease-out";

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = window.innerHeight + "px";
      confetti.style.transform += " translateY(20px)";
    }, 10);

    setTimeout(() => confetti.remove(), 1300);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div
        className={`
          bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center transform transition-all duration-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
        `}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`
              w-20 h-20 rounded-full bg-green-100 flex items-center justify-center 
              transition-all duration-700 transform
              ${visible ? "scale-100 opacity-100" : "scale-75 opacity-0"}
            `}
          >
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-green-600">
          Password Reset Successful
        </h1>

        <p className="text-gray-700 mb-6">
          Your password has been updated successfully.
        </p>

        {/* Logged-in user → Show dashboard button */}
        {session ? (
          <Link
            href="/dashboard"
            className="block w-full py-3 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Continue to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="block w-full py-3 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        )}

        {/* Redirect note if user is logged out */}
        {!session && (
          <p className="text-gray-500 text-sm mt-3">
            Redirecting to login in 4 seconds...
          </p>
        )}
      </div>
    </div>
  );
}
