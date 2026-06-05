function Sidebar({ setPage, styles, currentUser, canAccess }) {
  const menuItems = [
    { page: "dashboard", label: "لوحة التحكم" },
    { page: "pos", label: "نقطة البيع" },
    { page: "products", label: "المنتجات" },
    { page: "customers", label: "الزبائن" },
    { page: "suppliers", label: "الموردين" },
    { page: "salesInvoices", label: "فواتير المبيعات" },
    { page: "purchaseInvoices", label: "فواتير المشتريات" },
    { page: "customerStatement", label: "كشف حساب الزبائن" },
    { page: "supplierStatement", label: "كشف حساب الموردين" },
    { page: "reports", label: "التقارير" },
    { page: "settings", label: "الإعدادات" },
  ];

  const visibleItems = menuItems.filter((item) =>
    typeof canAccess === "function" ? canAccess(item.page) : true
  );

  return (
    <aside style={styles.sidebar}>
      <img
        src="/logo-hisabati.png"
        alt="حساباتي"
        style={styles.logoImage}
      />

      {currentUser && (
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            padding: "12px",
            marginBottom: "8px",
            fontSize: "14px",
            color: "#e2e8f0",
          }}
        >
          {currentUser.username} - {currentUser.role}
        </div>
      )}

      {visibleItems.map((item) => (
        <button
          key={item.page}
          style={styles.menuButton}
          onClick={() => setPage(item.page)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

export default Sidebar;
