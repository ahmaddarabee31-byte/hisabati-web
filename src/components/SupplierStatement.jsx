function SupplierStatement({
  suppliers,
  selectedSupplierStatement,
  selectedSupplierInvoice,
  setSelectedSupplierInvoice,
  setSelectedSupplierStatement,
  supplierPaymentAmount,
  setSupplierPaymentAmount,
  purchaseInvoices = [],
  supplierPayments = [],
  saveSupplierStatementPayment,
  styles,
}) {
  return (
    <>
      <h1>كشف حساب الموردين</h1>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>المورد</th>
            <th style={styles.th}>عرض</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td style={styles.td}>{supplier.name}</td>

              <td style={styles.td}>
                <button
                  style={styles.saveBtn}
                  onClick={() => setSelectedSupplierStatement(supplier)}
                >
                  كشف الحساب
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSupplierStatement &&
        (() => {
          const invoices = purchaseInvoices.filter(
            (i) =>
              i.supplierId === selectedSupplierStatement.id &&
              (i.invoiceStatus || i.invoice_status || "معتمدة") === "معتمدة"
          );

          const payments = supplierPayments.filter(
            (p) => p.supplier_id === selectedSupplierStatement.id
          );

          const totalInvoices = invoices.reduce(
            (sum, i) => sum + Number(i.total || 0),
            0
          );

          const totalPayments = payments.reduce(
            (sum, p) => sum + Number(p.amount || 0),
            0
          );

          const currentBalance = totalInvoices - totalPayments;

          const transactions = [
            ...invoices.map((i) => ({
              date: i.date,
              type: `فاتورة شراء #${i.invoiceNumber}`,
              debit: Number(i.total || 0),
              credit: 0,
              invoice: i,
            })),

            ...payments.map((p) => ({
              date: p.date,
              type: "دفعة للمورد",
              debit: 0,
              credit: Number(p.amount || 0),
            })),
          ].sort((a, b) => new Date(a.date) - new Date(b.date));

          let balance = 0;

          return (
            <div style={styles.card}>
              <h2>كشف حساب المورد: {selectedSupplierStatement.name}</h2>

              <div style={styles.cards}>
                <div style={styles.card}>
                  <h3>إجمالي المشتريات</h3>
                  <p>₪ {totalInvoices}</p>
                </div>

                <div style={styles.card}>
                  <h3>إجمالي الدفعات</h3>
                  <p>₪ {totalPayments}</p>
                </div>

                <div style={styles.card}>
                  <h3>الرصيد المستحق</h3>
                  <p>₪ {currentBalance}</p>
                </div>
              </div>

              <h3>تسجيل دفعة للمورد</h3>

              <input
                type="number"
                value={supplierPaymentAmount}
                onChange={(e) => setSupplierPaymentAmount(e.target.value)}
                placeholder="قيمة الدفعة"
                style={styles.input}
              />

              <button
                style={styles.saveBtn}
                onClick={() => {
                  if (!supplierPaymentAmount || Number(supplierPaymentAmount) <= 0) {
                    return alert("أدخل مبلغ صحيح");
                  }

                  if (Number(supplierPaymentAmount) > currentBalance) {
                    return alert("قيمة الدفعة أكبر من الرصيد المستحق");
                  }

                  saveSupplierStatementPayment(
                    selectedSupplierStatement,
                    Number(supplierPaymentAmount)
                  );
                }}
              >
                تسجيل دفعة
              </button>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>التاريخ</th>
                    <th style={styles.th}>البيان</th>
                    <th style={styles.th}>مدين</th>
                    <th style={styles.th}>دائن</th>
                    <th style={styles.th}>الرصيد</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((t, index) => {
                    balance =
                      balance + Number(t.debit || 0) - Number(t.credit || 0);

                    return (
                      <tr
                        key={index}
                        style={{
                          cursor: t.invoice ? "pointer" : "default",
                        }}
                        onClick={() => {
                          if (t.invoice) {
                            setSelectedSupplierInvoice(t.invoice);
                          }
                        }}
                      >
                        <td style={styles.td}>{t.date}</td>

                        <td style={styles.td}>{t.type}</td>

                        <td style={styles.td}>₪ {t.debit}</td>

                        <td style={styles.td}>₪ {t.credit}</td>

                        <td style={styles.td}>₪ {balance}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {selectedSupplierInvoice && (
                <div
                  style={styles.modalOverlay}
                  onClick={() => setSelectedSupplierInvoice(null)}
                >
                  <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedSupplierInvoice(null)}
                    >
                      ✖
                    </button>

                    <h2>
                      تفاصيل فاتورة الشراء #
                      {selectedSupplierInvoice.invoiceNumber}
                    </h2>

                    <h3>المورد: {selectedSupplierInvoice.supplierName}</h3>
                    <h3>المنتج: {selectedSupplierInvoice.productName}</h3>
                    <h3>الكمية: {selectedSupplierInvoice.qty}</h3>
                    <h3>سعر الشراء: ₪ {selectedSupplierInvoice.price}</h3>
                    <h3>الإجمالي: ₪ {selectedSupplierInvoice.total}</h3>
                    <h3>المدفوع: ₪ {selectedSupplierInvoice.paid}</h3>
                    <h3>المتبقي: ₪ {selectedSupplierInvoice.remaining}</h3>
                    <h3>التاريخ: {selectedSupplierInvoice.date}</h3>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
    </>
  );
}

export default SupplierStatement;
