export const styles = {
  app: {
    display: "flex",
    fontFamily: "'Cairo', Tahoma, sans-serif",
    background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
    minHeight: "100vh",
    color: "#0f172a",
  },

  sidebar: {
    width: "285px",
    background:
      "linear-gradient(180deg,#020617 0%,#0f172a 45%,#1e1b4b 100%)",
    color: "#fff",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    boxShadow: "0 0 45px rgba(2,6,23,0.35)",
  },

  content: {
    flex: 1,
    padding: "34px",
    overflowY: "auto",
  },
  

  logo: {
    textAlign: "center",
    marginBottom: "28px",
    fontSize: "32px",
    fontWeight: "900",
    color: "#93c5fd",
    letterSpacing: "1px",
  },

  menuButton: {
    background: "rgba(255,255,255,0.06)",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "15px 18px",
    borderRadius: "16px",
    cursor: "pointer",
    textAlign: "right",
    fontSize: "15px",
    fontWeight: "700",
    transition: "0.25s",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "22px",
    marginTop: "26px",
  },

  card: {
    background: "rgba(255,255,255,0.92)",
    padding: "26px",
    borderRadius: "26px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
    border: "1px solid rgba(226,232,240,0.9)",
    backdropFilter: "blur(10px)",
  },

  formCard: {
    background: "rgba(255,255,255,0.94)",
    padding: "28px",
    borderRadius: "26px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
    marginBottom: "28px",
  },

  input: {
  width: "100%",
  padding: "15px 16px",
  borderRadius: "16px",
  border: "1px solid #c7d2fe",
  background: "#ffffff",

  color: "#0f172a",
  WebkitTextFillColor: "#0f172a",
  caretColor: "#2563eb",

  fontSize: "16px",
  marginBottom: "13px",
  outline: "none",
  boxSizing: "border-box",
},

  textarea: {
    width: "100%",
    minHeight: "125px",
    padding: "15px 16px",
    borderRadius: "16px",
    border: "1px solid #c7d2fe",
    background: "#ffffff",
    fontSize: "15px",
    marginBottom: "13px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  saveBtn: {
    background: "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    border: "none",
    padding: "14px 30px",
    borderRadius: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  },

  deleteBtn: {
    background: "linear-gradient(135deg,#ef4444,#b91c1c)",
    color: "#fff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  editBtn: {
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    color: "#fff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  table: {
    width: "100%",
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    borderCollapse: "separate",
    borderSpacing: 0,
    boxShadow: "0 14px 35px rgba(15,23,42,0.07)",
    marginTop: "22px",
  },

  th: {
    background: "linear-gradient(135deg,#2563eb,#1e40af)",
    color: "#fff",
    padding: "16px",
    fontWeight: "800",
    textAlign: "center",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #eef2f7",
    textAlign: "center",
    color: "#334155",
  },
  logoImage: {
    width: "150px",
    margin: "0 auto 25px",
    display: "block",
    borderRadius: "18px",
  },
  modalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
},

modal: {
  background: "white",
  width: "80%",
  maxWidth: "900px",
  maxHeight: "80vh",
  overflowY: "auto",
  borderRadius: "16px",
  padding: "25px",
},
  printBtn: {
    background: "linear-gradient(135deg,#0f172a,#334155)",
    color: "#fff",
    border: "none",
    padding: "14px 26px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "800",
  },


  loginPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Cairo', Tahoma, sans-serif",
    background: "linear-gradient(135deg,#020617,#1e3a8a)",
  },

  loginCard: {
    width: "420px",
    background: "white",
    borderRadius: "28px",
    padding: "34px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.28)",
    textAlign: "center",
  },

  userBar: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "12px 18px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "800",
    boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
  },

  logoutBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "800",
  },

  badgePaid: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "7px 14px",
    borderRadius: "999px",
    fontWeight: "800",
  },

  badgePartial: {
    background: "#fef3c7",
    color: "#b45309",
    padding: "7px 14px",
    borderRadius: "999px",
    fontWeight: "800",
  },

  badgeDebt: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "7px 14px",
    borderRadius: "999px",
    fontWeight: "800",
  },
};
/*export const styles = {
  app: {
    display: "flex",
    fontFamily: "'Cairo', Tahoma, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  sidebar: {
    width: "270px",
    background: "linear-gradient(180deg,#0f172a,#1e293b)",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 0 25px rgba(0,0,0,0.15)",
  },

  content: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },

  logo: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#60a5fa",
  },

  menuButton: {
    background: "#1e293b",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    textAlign: "right",
    transition: "0.3s",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    marginTop: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },

  formCard: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
    marginBottom: "25px",
    maxWidth: "600px",
  },

  input: {
    display: "block",
    width: "100%",
    maxWidth: "550px",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    background: "#fff",
    outline: "none",
  },

  textarea: {
    display: "block",
    width: "100%",
    maxWidth: "550px",
    height: "120px",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    resize: "vertical",
    background: "#fff",
  },

  saveBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "0.3s",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  editBtn: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    marginTop: "25px",
    background: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    borderCollapse: "collapse",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  },

  th: {
    background: "#2563eb",
    color: "white",
    padding: "15px",
    textAlign: "center",
    fontWeight: "bold",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
  },

  badgePaid: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
  },

  badgePartial: {
    background: "#fef3c7",
    color: "#b45309",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
  },

  badgeDebt: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
  },
};*/

/*export const styles = {
  app: {
    display: "flex",
    fontFamily: "Tahoma",
    background: "#f5f7fb",
    minHeight: "100vh",
  },

  sidebar: {
    width: "260px",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  content: {
    flex: 1,
    padding: "30px",
  },

  logo: {
    textAlign: "center",
    marginBottom: "20px",
  },

  menuButton: {
    background: "#1e293b",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "30px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  formCard: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "25px",
    maxWidth: "550px",
    marginRight: "auto",
  },

  input: {
    display: "block",
    width: "100%",
    maxWidth: "500px",
    padding: "15px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "18px",
  },

  textarea: {
    display: "block",
    width: "100%",
    maxWidth: "500px",
    height: "120px",
    padding: "15px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "18px",
  },

  saveBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "14px 30px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "18px",
  },

  table: {
    width: "100%",
    marginTop: "25px",
    background: "white",
    borderCollapse: "collapse",
    fontSize: "16px",
  },

  th: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
};*/