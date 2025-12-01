// components/Toast.js
import { useEffect } from "react";

export default function Toast({ id, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 2600);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      style={{
        background: "#0f766e",
        color: "white",
        padding: "12px 18px",
        marginBottom: "10px",
        borderRadius: "8px",
        fontWeight: "600",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        animation: "slideIn 0.25s ease",
      }}
    >
      {message}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
