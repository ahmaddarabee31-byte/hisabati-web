function Dashboard({
  products,
  customers,
  suppliers,
  salesInvoices,
  totalCustomerDebt,
  totalSupplierDebt,
  lowStockProducts,
  styles,
}) {
  return (
    <>
      <h1>برنامج حساباتي</h1>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>عدد المنتجات</h3>
          <p>{products.length}</p>
        </div>

        <div style={styles.card}>
          <h3>عدد الزبائن</h3>
          <p>{customers.length}</p>
        </div>

        <div style={styles.card}>
          <h3>عدد الموردين</h3>
          <p>{suppliers.length}</p>
        </div>

        <div style={styles.card}>
          <h3>عدد فواتير المبيعات</h3>
          <p>{salesInvoices.length}</p>
        </div>

        <div style={styles.card}>
          <h3>ذمم الزبائن</h3>
          <p>₪ {totalCustomerDebt}</p>
        </div>

        <div style={styles.card}>
          <h3>ذمم الموردين</h3>
          <p>₪ {totalSupplierDebt}</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div style={styles.card}>
          <h2>⚠️ منتجات قاربت على النفاد</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>المنتج</th>
                <th style={styles.th}>الكمية</th>
              </tr>
            </thead>

            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Dashboard;