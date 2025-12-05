"use client";

import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

// Dynamic client-only imports
const RTToastContainer = dynamic(
  () => import("react-toastify").then((m) => m.ToastContainer),
  { ssr: false }
);

let toast;
let Slide;

// Load toast & Slide only on client
if (typeof window !== "undefined") {
  import("react-toastify").then((m) => {
    toast = m.toast;
    Slide = m.Slide;
  });
}

// 🎨 Base Toast Styles
const toastStyle = {
  borderRadius: "10px",
  fontSize: "15px",
  padding: "12px 15px",
};

// 🎨 Color Themes
const themeColors = {
  success: { background: "#0f766e", color: "#fff" },
  info: { background: "#0ea5e9", color: "#fff" },
  warning: { background: "#f59e0b", color: "#fff" },
  error: { background: "#dc2626", color: "#fff" },
};

export const ToastContainer = () => {
  return (
    <RTToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      transition={Slide}
      toastStyle={toastStyle}
      newestOnTop
    />
  );
};

// GENERAL TOAST
export const showToast = (message, type = "info") => {
  if (!toast) return; // Prevent SSR crash
  toast(message, {
    type,
    style: themeColors[type] || themeColors.info,
  });
};

// UNDO TOAST
export const showUndoToast = (message, onUndo) => {
  if (!toast) return; // Prevent SSR crash

  toast(
    ({ closeToast }) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>{message}</span>
        <button
          onClick={() => {
            onUndo();
            closeToast();
          }}
          style={{
            background: "#fff",
            color: "#0f766e",
            padding: "4px 10px",
            fontWeight: "700",
            borderRadius: "6px",
            border: "1px solid #0f766e",
            cursor: "pointer",
          }}
        >
          Undo
        </button>
      </div>
    ),
    {
      style: themeColors.warning,
    }
  );
};
