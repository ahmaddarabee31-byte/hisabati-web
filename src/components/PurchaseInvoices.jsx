function PurchaseInvoices({
  purchaseInvoiceSearch,
  setPurchaseInvoiceSearch,
  purchaseSupplierId,
  setPurchaseSupplierId,
  suppliers,
  purchaseProductId,
  setPurchaseProductId,
  products,
  purchaseQty,
  setPurchaseQty,
  purchaseInvoicePrice,
  setPurchaseInvoicePrice,
  purchasePaid,
  setPurchasePaid,
  purchaseDate,
  setPurchaseDate,
  purchaseInvoiceStatus = "مسودة",
  setPurchaseInvoiceStatus,
  savePurchaseInvoice,
  selectedPurchaseInvoice,
  setSelectedPurchaseInvoice,
  purchaseInvoices = [],
  approvePurchaseInvoice,
  cancelPurchaseInvoice,
  styles,
}) {
  const getInvoiceStatus = (invoice) => invoice.invoiceStatus || "معتمدة";

  const statusStyle = (status) => ({
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    background:
      status === "معتمدة" ? "#dcfce7" : status === "مسودة" ? "#fef9c3" : "#fee2e2",
    color:
      status === "معتمدة" ? "#166534" : status === "مسودة" ? "#854d0e" : "#991b1b",
  });

  const filteredInvoices = purchaseInvoices.filter(
    (invoice) =>
      String(invoice.invoiceNumber || "").includes(purchaseInvoiceSearch) ||
      (invoice.supplierName || "")
        .toLowerCase()
        .includes((purchaseInvoiceSearch || "").toLowerCase()) ||
      getInvoiceStatus(invoice).includes(purchaseInvoiceSearch || "")
  );

  return (
    <>
      <h1>فواتير المشتريات</h1>

      <input
        value={purchaseInvoiceSearch}
        onChange={(e) => setPurchaseInvoiceSearch(e.target.value)}
        placeholder="بحث برقم الفاتورة أو اسم المورد أو الحالة..."
        style={styles.input}
      />

      <div style={styles.formCard}>
        <select
          value={purchaseSupplierId}
          onChange={(e) => setPurchaseSupplierId(e.target.value)}
          style={styles.input}
        >
          <option value="">اختر المورد</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={purchaseProductId}
          onChange={(e) => setPurchaseProductId(e.target.value)}
          style={styles.input}
        >
          <option value="">اختر المنتج</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={purchaseQty}
          onChange={(e) => setPurchaseQty(e.target.value)}
          placeholder="الكمية"
          style={styles.input}
        />

        <input
          type="number"
          value={purchaseInvoicePrice}
          onChange={(e) => setPurchaseInvoicePrice(e.target.value)}
          placeholder="سعر الشراء"
          style={styles.input}
        />

        <input
          type="number"
          value={purchasePaid}
          onChange={(e) => setPurchasePaid(e.target.value)}
          placeholder="المبلغ المدفوع"
          style={styles.input}
        />

        <label>تاريخ الفاتورة</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          style={styles.input}
        />

        <label>حالة الفاتورة</label>
        <select
          value={purchaseInvoiceStatus}
          onChange={(e) => setPurchaseInvoiceStatus?.(e.target.value)}
          style={styles.input}
        >
          <option value="مسودة">مسودة</option>
          <option value="معتمدة">معتمدة</option>
        </select>

        <button style={styles.saveBtn} onClick={savePurchaseInvoice}>
          {purchaseInvoiceStatus === "مسودة" ? "حفظ كمسودة" : "حفظ واعتماد"}
        </button>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>رقم الفاتورة</th>
              <th style={styles.th}>المورد</th>
              <th style={styles.th}>المنتج</th>
              <th style={styles.th}>الإجمالي</th>
              <th style={styles.th}>المدفوع</th>
              <th style={styles.th}>المتبقي</th>
              <th style={styles.th}>السداد</th>
              <th style={styles.th}>حالة الفاتورة</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((invoice) => {
              const invoiceStatus = getInvoiceStatus(invoice);
              return (
                <tr
                  key={invoice.id}
                  onClick={() => setSelectedPurchaseInvoice(invoice)}
                  style={{
                    cursor: "pointer",
                    opacity: invoiceStatus === "ملغاة" ? 0.55 : 1,
                    textDecoration: invoiceStatus === "ملغاة" ? "line-through" : "none",
                  }}
                >
                  <td style={styles.td}>{invoice.invoiceNumber}</td>
                  <td style={styles.td}>{invoice.supplierName}</td>
                  <td style={styles.td}>{invoice.productName}</td>
                  <td style={styles.td}>₪ {invoice.total}</td>
                  <td style={styles.td}>₪ {invoice.paid}</td>
                  <td style={styles.td}>₪ {invoice.remaining}</td>
                  <td style={styles.td}>{invoice.status || "مدفوعة"}</td>
                  <td style={styles.td}>
                    <span style={statusStyle(invoiceStatus)}>{invoiceStatus}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {selectedPurchaseInvoice && (
          <div style={styles.card}>
            <h2>تفاصيل فاتورة الشراء #{selectedPurchaseInvoice.invoiceNumber}</h2>
            <h3>المورد: {selectedPurchaseInvoice.supplierName}</h3>
            <h3>المنتج: {selectedPurchaseInvoice.productName}</h3>
            <h3>الكمية: {selectedPurchaseInvoice.qty}</h3>
            <h3>سعر الشراء: ₪ {selectedPurchaseInvoice.price}</h3>
            <h3>الإجمالي: ₪ {selectedPurchaseInvoice.total}</h3>
            <h3>المدفوع: ₪ {selectedPurchaseInvoice.paid}</h3>
            <h3>المتبقي للمورد: ₪ {selectedPurchaseInvoice.remaining}</h3>
            <h3>التاريخ: {selectedPurchaseInvoice.date}</h3>
            <h3>حالة السداد: {selectedPurchaseInvoice.status || "مدفوعة"}</h3>
            <h3>
              حالة الفاتورة: <span style={statusStyle(getInvoiceStatus(selectedPurchaseInvoice))}>{getInvoiceStatus(selectedPurchaseInvoice)}</span>
            </h3>

            {getInvoiceStatus(selectedPurchaseInvoice) === "مسودة" && (
              <button
                onClick={() => approvePurchaseInvoice?.(selectedPurchaseInvoice)}
                style={{
                  ...(styles.saveBtn || styles.printBtn),
                  marginTop: "10px",
                  marginLeft: "10px",
                  background: "#16a34a",
                  color: "white",
                }}
              >
                اعتماد الفاتورة
              </button>
            )}

            {getInvoiceStatus(selectedPurchaseInvoice) !== "ملغاة" && (
              <button
                onClick={() => cancelPurchaseInvoice?.(selectedPurchaseInvoice)}
                style={{
                  ...(styles.deleteBtn || styles.printBtn || styles.saveBtn),
                  marginTop: "10px",
                  background: "#dc2626",
                  color: "white",
                }}
              >
                إلغاء الفاتورة
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default PurchaseInvoices;
