function Liabilities({
  suppliers,
  purchaseInvoices,
  selectedSupplier,
  setSelectedSupplier,
  supplierPaymentAmount,
  setSupplierPaymentAmount,
  supplierPaymentDate,
  setSupplierPaymentDate,
  saveSupplierPayment,
  safeParseArray,
  styles,
}) {
  return (
    <>
      <h1>ذمم الموردين</h1>

      <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>المورد</th>
                  <th style={styles.th}>الرصيد المستحق</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => {
                  const supplierInvoices = purchaseInvoices.filter(
                    (i) => i.supplierId === supplier.id
                  );

                  const balance = supplierInvoices.reduce(
                    (sum, i) => sum + Number(i.remaining || 0),
                    0
                  );

                  return (
                    <tr key={supplier.id}>
                      <td
                        style={{
                          ...styles.td,
                          cursor: "pointer",
                          color: "#2563eb",
                          fontWeight: "bold",
                        }}
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        {supplier.name}
                      </td>

                      <td style={styles.td}>₪ {balance}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {selectedSupplier && (
              <div style={styles.card}>
                <h2>{selectedSupplier.name}</h2>

                <h3>
                  الرصيد المستحق: ₪{" "}
                  {purchaseInvoices
                    .filter((i) => i.supplierId === selectedSupplier.id)
                    .reduce((sum, i) => sum + Number(i.remaining || 0), 0)}
                </h3>

                <input
                  type="number"
                  value={supplierPaymentAmount}
                  onChange={(e) => setSupplierPaymentAmount(e.target.value)}
                  placeholder="قيمة الدفعة للمورد"
                  style={styles.input}
                />

                <input
                  type="date"
                  value={supplierPaymentDate}
                  onChange={(e) => setSupplierPaymentDate(e.target.value)}
                  style={styles.input}
                />

                <button
                  style={styles.saveBtn}
                  onClick={() => {
  const invoices =
    JSON.parse(localStorage.getItem("purchaseInvoices")) || [];

  const totalRemaining = invoices
    .filter(
      (invoice) =>
        invoice.supplierId === selectedSupplier.id
    )
    .reduce(
      (sum, invoice) =>
        sum + Number(invoice.remaining || 0),
      0
    );

  if (Number(supplierPaymentAmount) > totalRemaining) {
    return alert("قيمة الدفعة أكبر من الرصيد المستحق للمورد");
  }

  saveSupplierPayment(
    selectedSupplier,
    supplierPaymentAmount,
    supplierPaymentDate
  );
}}
                >
                  تسجيل دفعة للمورد
                </button>

                {(() => {
                  const supplierPayments = safeParseArray("supplierPayments").filter(
                    (p) => p.supplierId === selectedSupplier.id
                  );

                  return (
                    <>
                      <h3>دفعات المورد</h3>

                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>التاريخ</th>
                            <th style={styles.th}>المبلغ</th>
                          </tr>
                        </thead>

                        <tbody>
                          {supplierPayments.map((p) => (
                            <tr key={p.id}>
                              <td style={styles.td}>{p.date}</td>
                              <td style={styles.td}>₪ {p.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  );
                })()}

                <h3>الهاتف: {selectedSupplier.phone}</h3>
                <h3>العنوان: {selectedSupplier.address}</h3>
              </div>
            )}
    </>
  );
}

export default Liabilities;