import DashboardNavbar from "./DashboardNavbar";

export default function DashboardLayout({ children }) {
  return (
    <>
      <DashboardNavbar />

      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </>
  );
}
