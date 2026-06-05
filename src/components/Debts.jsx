function Debts({
  selectedDebtCustomer,
  setSelectedDebtCustomer,
  paymentAmount,
  setPaymentAmount,
  safeParseArray,
  saveArray,
  applyPaymentToInvoices,
  styles,
}) {
  return (
    <>
      <h1>الديون</h1>

        <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>رقم الفاتورة</th>
                  <th style={styles.th}>الزبون</th>
                  <th style={styles.th}>المتبقي</th>
                  <th style={styles.th}>التاريخ</th>
                </tr>
              </thead>

              <tbody>
                {safeParseArray("salesInvoices")
                  .filter((invoice) => Number(invoice.remaining) > 0)
                  .map((invoice) => (
                    <tr key={invoice.id}>
                      <td style={styles.td}>{invoice.invoiceNumber}</td>

                      <td
                        style={{
                          ...styles.td,
                          cursor: "pointer",
                          color: "#2563eb",
                          fontWeight: "bold",
                        }}
                        onClick={() => setSelectedDebtCustomer(invoice.customerName)}
                      >
                        {invoice.customerName}
                      </td>

                      <td style={styles.td}>₪ {invoice.remaining}</td>
                      <td style={styles.td}>{invoice.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {selectedDebtCustomer && (
              <div style={styles.card}>
                <h2>كشف حساب: {selectedDebtCustomer}</h2>

                {(() => {
                  const customerInvoices = safeParseArray("salesInvoices").filter(
                    (i) => i.customerName === selectedDebtCustomer
                  );

                  const totalDebt = customerInvoices.reduce(
                    (sum, i) => sum + Number(i.remaining || 0),
                    0
                  );

                  return (
                    <>
                      <h3>إجمالي الذمم: ₪ {totalDebt}</h3>

                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="قيمة الدفعة"
                        style={styles.input}
                      />

                      <button
                        style={styles.saveBtn}
                        onClick={() => {
                          if (!paymentAmount || Number(paymentAmount) <= 0) {
                            return alert("أدخل مبلغ الدفعة");
                          }

                          const payments = safeParseArray("customerPayments");

                          const newPayment = {
                            id: Date.now(),
                            customerName: selectedDebtCustomer,
                            amount: Number(paymentAmount),
                            date: new Date().toISOString().split("T")[0],
                            notes: "",
                          };

                          saveArray("customerPayments", [...payments, newPayment]);

                          const updatedInvoices = applyPaymentToInvoices(
                            safeParseArray("salesInvoices"),
                            (invoice) => invoice.customerName === selectedDebtCustomer,
                            paymentAmount,
                            "paidAmount"
                          );

                          saveArray("salesInvoices", updatedInvoices);

                          setPaymentAmount("");
                          alert("تم تسجيل الدفعة");
                        }}
                      >
                        تسجيل دفعة
                      </button>

                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>رقم الفاتورة</th>
                            <th style={styles.th}>التاريخ</th>
                            <th style={styles.th}>المبلغ</th>
                            <th style={styles.th}>المدفوع</th>
                            <th style={styles.th}>المتبقي</th>
                          </tr>
                        </thead>

                        <tbody>
                          {customerInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td style={styles.td}>{invoice.invoiceNumber}</td>
                              <td style={styles.td}>{invoice.date}</td>
                              <td style={styles.td}>₪ {invoice.grandTotal}</td>
                              <td style={styles.td}>₪ {invoice.paidAmount}</td>
                              <td style={styles.td}>₪ {invoice.remaining}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  );
                })()}
              </div>
            )}
          
    </>
  );
}

export default Debts;