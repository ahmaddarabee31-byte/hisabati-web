function CustomerLiabilities({
  customers,
  selectedCustomerDebt,
  setSelectedCustomerDebt,
  selectedCustomerInvoice,
  setSelectedCustomerInvoice,
  paymentAmount,
  setPaymentAmount,
  safeParseArray,
  saveArray,
  applyPaymentToInvoices,
  styles,
}) {
  return (
    <>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>الزبون</th>
            <th style={styles.th}>إجمالي الذمم</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => {
            const invoiceDebt = safeParseArray("salesInvoices")
              .filter((i) => i.customerName === customer.name)
              .reduce((sum, i) => sum + Number(i.remaining || 0), 0);

            const balance = invoiceDebt;

            return (
              <tr key={customer.id}>
                <td
                  style={{
                    ...styles.td,
                    cursor: "pointer",
                    color: "#2563eb",
                    fontWeight: "bold",
                  }}
                  onClick={() => setSelectedCustomerDebt(customer)}
                >
                  {customer.name}
                </td>

                <td style={styles.td}>₪ {balance}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedCustomerDebt && (
        <div style={styles.card}>
          <h2>{selectedCustomerDebt.name}</h2>

          {(() => {
            const customerInvoices = safeParseArray("salesInvoices").filter(
              (i) => i.customerName === selectedCustomerDebt.name
            );

            const totalDebt = customerInvoices.reduce(
              (sum, i) => sum + Number(i.remaining || 0),
              0
            );

            const customerPayments = safeParseArray("customerPayments").filter(
              (p) => p.customerName === selectedCustomerDebt.name
            );

            const totalPayments = customerPayments.reduce(
              (sum, p) => sum + Number(p.amount || 0),
              0
            );

            const finalBalance = totalDebt;

            return (
              <>
                <h3>إجمالي الذمم: ₪ {totalDebt}</h3>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>الفاتورة</th>
                      <th style={styles.th}>التاريخ</th>
                      <th style={styles.th}>المبلغ</th>
                      <th style={styles.th}>المدفوع</th>
                      <th style={styles.th}>المتبقي</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customerInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelectedCustomerInvoice(invoice)}
                        style={{ cursor: "pointer" }}
                      >
                        <td style={styles.td}>{invoice.invoiceNumber}</td>
                        <td style={styles.td}>{invoice.date}</td>
                        <td style={styles.td}>₪ {invoice.grandTotal}</td>
                        <td style={styles.td}>₪ {invoice.paidAmount}</td>
                        <td style={styles.td}>₪ {invoice.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ margin: "20px 0" }}>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="قيمة الدفعة"
                    style={styles.input}
                  />

                  <button
                    style={{ ...styles.saveBtn, marginTop: "10px" }}
                    onClick={() => {
                      if (!paymentAmount || Number(paymentAmount) <= 0) {
                        return alert("أدخل مبلغ الدفعة");
                      }

                      const saved = safeParseArray("customerPayments");
                      
                      const totalRemaining = invoices
                        .filter((invoice) => invoice.customerName === customer.name)
                        .reduce((sum, invoice) => sum + Number(invoice.remaining || 0), 0);

                      if (Number(paymentAmount) > totalRemaining) {
                        return alert("قيمة الدفعة أكبر من الرصيد المتبقي");
                      }

                      const newPayment = {
                        id: Date.now(),
                        customerId: selectedCustomerDebt.id,
                        customerName: selectedCustomerDebt.name,
                        amount: Number(paymentAmount),
                        date: new Date().toISOString().split("T")[0],
                        notes: "",
                      };

                      saveArray("customerPayments", [...saved, newPayment]);

                      const updatedInvoices = applyPaymentToInvoices(
                        safeParseArray("salesInvoices"),
                        (invoice) =>
                          invoice.customerName === selectedCustomerDebt.name,
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
                </div>

                <h3>إجمالي الدفعات: ₪ {totalPayments}</h3>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>التاريخ</th>
                      <th style={styles.th}>المبلغ</th>
                      <th style={styles.th}>ملاحظات</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customerPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td style={styles.td}>{payment.date}</td>
                        <td style={styles.td}>₪ {payment.amount}</td>
                        <td style={styles.td}>{payment.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: "20px",
                    color: finalBalance > 0 ? "#dc2626" : "#16a34a",
                  }}
                >
                  الرصيد النهائي: ₪ {finalBalance}
                </h3>

                {selectedCustomerInvoice && (
                  <div style={styles.card}>
                    <h2>
                      تفاصيل الفاتورة #
                      {selectedCustomerInvoice.invoiceNumber}
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
                        {selectedCustomerInvoice.items.map((item) => (
                          <tr key={item.id}>
                            <td style={styles.td}>{item.name}</td>
                            <td style={styles.td}>₪ {item.price}</td>
                            <td style={styles.td}>{item.qty}</td>
                            <td style={styles.td}>₪ {item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}

export default CustomerLiabilities;