import { useAuth } from "../context/AuthContext";
import { IngestPanel } from "../components/IngestPanel";

export function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>HARDWOOD</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#888", fontSize: "14px" }}>
            {user?.email}
          </span>
          <button
            onClick={signOut}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #333",
              borderRadius: "6px",
              color: "#888",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={{ padding: "32px" }}>
        <IngestPanel />
      </main>
    </div>
  );
}