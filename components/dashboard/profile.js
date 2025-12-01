import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <div style={styles.container}>

        <h1 style={styles.heading}>My Profile</h1>

        {/* PROFILE CARD */}
        <div style={styles.card}>
          <div style={styles.avatarBig}>
            {session?.user?.firstName?.charAt(0).toUpperCase()}
          </div>

          <h2 style={styles.name}>
            {session?.user?.firstName} {session?.user?.lastName}
          </h2>

          <p style={styles.email}>{session?.user?.email}</p>
        </div>

        {/* SETTINGS FORM */}
        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Account Information</h3>

          <label style={styles.label}>First Name</label>
          <input style={styles.input} defaultValue={session?.user?.firstName} />

          <label style={styles.label}>Last Name</label>
          <input style={styles.input} defaultValue={session?.user?.lastName} />

          <label style={styles.label}>Email</label>
          <input style={styles.input} defaultValue={session?.user?.email} disabled />

          <button style={styles.saveBtn}>Save Changes</button>
        </div>

      </div>
    </DashboardLayout>
  );
}

const styles = {
  container: {
    padding: "40px",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f766e",
    marginBottom: "25px",
  },

  /* PROFILE CARD */
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "30px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "40px",
  },
  avatarBig: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#0f766e",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 auto 15px",
  },
  name: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f766e",
  },
  email: {
    color: "#555",
    marginTop: "5px",
  },

  /* FORM */
  formCard: {
    background: "#fff",
    padding: "30px",
    maxWidth: "500px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#0f766e",
  },
  label: {
    display: "block",
    marginTop: "15px",
    fontSize: "14px",
    color: "#333",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
  },
  saveBtn: {
    marginTop: "25px",
    background: "#0f766e",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
  },
};
