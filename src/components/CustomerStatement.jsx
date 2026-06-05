function CustomerStatement({
  customers,
  selectedCustomerStatement,
  setSelectedCustomerStatement,
  selectedStatementInvoice,
  setSelectedStatementInvoice,
  paymentAmount,
  setPaymentAmount,
  salesInvoices = [],
  customerPayments = [],
  saveCustomerStatementPayment,
  styles,
}) {
  return (
    <>
      <h1>كشف حساب الزبائن</h1>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>الزبون</th>
            <th style={styles.th}>عرض</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td style={styles.td}>{customer.name}</td>
              <td style={styles.td}>
                <button
                  style={styles.saveBtn}
                  onClick={() => setSelectedCustomerStatement(customer)}
                >
                  كشف الحساب
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCustomerStatement &&
        (() => {
          const invoices = salesInvoices.filter(
            (i) =>
              i.customerId === selectedCustomerStatement.id &&
              (i.invoiceStatus || i.invoice_status || "معتمدة") === "معتمدة"
          );

          const payments = customerPayments.filter(
            (p) => p.customer_id === selectedCustomerStatement.id
          );

          const totalInvoices = invoices.reduce(
            (sum, i) => sum + Number(i.grandTotal || 0),
            0
          );

          const totalPayments = payments.reduce(
            (sum, p) => sum + Number(p.amount || 0),
            0
          );

          const currentBalance = invoices.reduce(
            (sum, i) => sum + Number(i.remaining || 0),
            0
          );

          const transactions = [
            ...invoices.map((i) => ({
              date: i.date,
              type: `فاتورة #${i.invoiceNumber}`,
              debit: Number(i.grandTotal || 0),
              credit: 0,
              invoice: i,
            })),
            ...payments.map((p) => ({
              date: p.date,
              type: "دفعة",
              debit: 0,
              credit: Number(p.amount || 0),
            })),
          ].sort((a, b) => new Date(a.date) - new Date(b.date));

          let balance = 0;

          return (
            <div style={styles.card}>
              <h2>كشف حساب: {selectedCustomerStatement.name}</h2>

              <div style={styles.cards}>
                <div style={styles.card}>
                  <h3>إجمالي الفواتير</h3>
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

              <h3>تسجيل دفعة</h3>

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
                    return alert("أدخل مبلغ صحيح");
                  }

                  if (Number(paymentAmount) > currentBalance) {
                    return alert("قيمة الدفعة أكبر من المستحق");
                  }

                  saveCustomerStatementPayment(
                    selectedCustomerStatement,
                    Number(paymentAmount)
                  );
                }}
              >
                تسجيل دفعة
              </button>

              <h3>الحركات</h3>

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
                            setSelectedStatementInvoice(t.invoice);
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

              {selectedStatementInvoice && (
                <div
                  style={styles.modalOverlay}
                  onClick={() => setSelectedStatementInvoice(null)}
                >
                  <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={{
                        float: "left",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedStatementInvoice(null)}
                    >
                      ✖
                    </button>

                    <h2>
                      تفاصيل الفاتورة #{selectedStatementInvoice.invoiceNumber}
                    </h2>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>الصنف</th>
                          <th style={styles.th}>السعر</th>
                          <th style={styles.th}>الكمية</th>
                          <th style={styles.th}>المجموع</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(selectedStatementInvoice.items || []).map((item, index) => (
                          <tr key={`${item.id}-${index}`}>
                            <td style={styles.td}>{item.name}</td>
                            <td style={styles.td}>₪ {item.price}</td>
                            <td style={styles.td}>{item.qty}</td>
                            <td style={styles.td}>₪ {item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h3>المجموع: ₪ {selectedStatementInvoice.total}</h3>
                    <h3>الخصم: ₪ {selectedStatementInvoice.discount || 0}</h3>
                    <h3>الصافي: ₪ {selectedStatementInvoice.grandTotal}</h3>
                    <h3>
                      المدفوع: ₪ {selectedStatementInvoice.paidAmount || 0}
                    </h3>
                    <h3>
                      المتبقي: ₪ {selectedStatementInvoice.remaining || 0}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
    </>
  );
}

export default CustomerStatement;
