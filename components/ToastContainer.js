import { ToastContainer as RTToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
return ( <RTToastContainer
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
toast(message, {
type,
style: themeColors[type] || themeColors.info,
});
};

// UNDO TOAST
export const showUndoToast = (message, onUndo) => {
toast(
({ closeToast }) => (
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}> <span>{message}</span>
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
