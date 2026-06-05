import QRCode from "qrcode";

function SalesInvoices({
  invoiceSearch,
  setInvoiceSearch,
  selectedInvoice,
  setSelectedInvoice,
  styles,
  salesInvoices = [],
  approveSalesInvoice,
  cancelSalesInvoice,
  storeSettings,
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


  const safePrintText = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const printThermalInvoice = async (invoice) => {
    if (!invoice) return;

    const invoiceNumber = invoice.invoiceNumber || "";
    const customerName = invoice.customerName || "زبون نقدي";
    const storeName = storeSettings?.storeName || "حساباتي";
    const storePhone = storeSettings?.phone || "";
    const storeAddress = storeSettings?.address || "";
    const storeLogo = storeSettings?.logo || "/logo-hisabati.png";
    const total = Number(invoice.total || 0);
    const discount = Number(invoice.discount || 0);
    const grandTotal = Number(invoice.grandTotal || invoice.total || 0);
    const paidAmount = Number(invoice.paidAmount || 0);
    const remaining = Number(invoice.remaining || 0);

    const qrText = `
فاتورة رقم: ${invoiceNumber}
الزبون: ${customerName}
المبلغ: ${grandTotal}
`;

    let qrImage = "";
    try {
      qrImage = await QRCode.toDataURL(qrText);
    } catch (error) {
      console.error("QR generation error:", error);
    }

    const printWindow = window.open("", "", "width=300,height=600");
    if (!printWindow) {
      alert("المتصفح منع نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم جرّب مرة أخرى.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة</title>
          <style>
            body {
              width: 80mm;
              font-family: Tahoma;
              direction: rtl;
              padding: 10px;
              font-size: 12px;
            }

            h2, p {
              text-align: center;
              margin: 4px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th, td {
              border-bottom: 1px dashed #000;
              padding: 4px;
              text-align: center;
              font-size: 11px;
            }

            .total {
              margin-top: 10px;
              font-weight: bold;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <img
            src="${safePrintText(storeLogo)}"
            style="width:80px;display:block;margin:auto;margin-bottom:10px;"
          />

          <h2>${safePrintText(storeName)}</h2>
          ${storePhone ? `<p>الهاتف: ${safePrintText(storePhone)}</p>` : ""}
          ${storeAddress ? `<p>العنوان: ${safePrintText(storeAddress)}</p>` : ""}
          <p>فاتورة مبيعات</p>

          <hr>

          <p>رقم الفاتورة: ${safePrintText(invoiceNumber)}</p>
          <p>التاريخ: ${safePrintText(invoice.date)}</p>
          <p>الزبون: ${safePrintText(customerName)}</p>

          <hr>

          <table>
            <thead>
              <tr>
                <th>الصنف</th>
                <th>ك</th>
                <th>سعر</th>
                <th>مجموع</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || [])
                .map(
                  (item) => `
                    <tr>
                      <td>${safePrintText(item.name)}</td>
                      <td>${safePrintText(item.qty)}</td>
                      <td>${safePrintText(item.price)}</td>
                      <td>${safePrintText(item.total)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <div class="total">المجموع: ₪ ${safePrintText(total)}</div>
          <div class="total">الخصم: ₪ ${safePrintText(discount)}</div>
          <div class="total">الصافي: ₪ ${safePrintText(grandTotal)}</div>
          <div class="total">المدفوع: ₪ ${safePrintText(paidAmount)}</div>
          <div class="total">المتبقي: ₪ ${safePrintText(remaining)}</div>

          ${
            qrImage
              ? `<img src="${qrImage}" style="width:100px;display:block;margin:12px auto;" />`
              : ""
          }

          <p>شكراً لزيارتكم</p>

          <script>
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };


  const printA4Invoice = (invoice) => {
    if (!invoice) return;

    const invoiceNumber = safePrintText(invoice.invoiceNumber || "");
    const customerName = safePrintText(invoice.customerName || "زبون نقدي");
    const storeName = safePrintText(storeSettings?.storeName || "حساباتي");
    const storePhone = safePrintText(storeSettings?.phone || "");
    const storeAddress = safePrintText(storeSettings?.address || "");
    const storeLogo = safePrintText(storeSettings?.logo || "/logo-hisabati.png");
    const total = Number(invoice.total || 0);
    const discount = Number(invoice.discount || 0);
    const grandTotal = Number(invoice.grandTotal || invoice.total || 0);
    const paidAmount = Number(invoice.paidAmount || 0);
    const remaining = Number(invoice.remaining || 0);

    const printWindow = window.open("", "", "width=900,height=700");
    if (!printWindow) {
      alert("المتصفح منع نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم جرّب مرة أخرى.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة A4</title>
          <style>
            @page { size: A4; margin: 14mm; }
            * { box-sizing: border-box; }
            body { font-family: Tahoma, Arial, sans-serif; direction: rtl; color: #0f172a; margin: 0; background: white; }
            .invoice { min-height: 260mm; display: flex; flex-direction: column; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e40af; padding-bottom: 18px; }
            .brand { display: flex; align-items: center; gap: 14px; }
            .brand img { width: 92px; height: 92px; object-fit: contain; border-radius: 18px; }
            .brand h1 { margin: 0; font-size: 30px; color: #1e40af; }
            .brand p { margin: 5px 0 0; color: #475569; font-size: 13px; }
            .invoice-box { text-align: left; direction: ltr; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 14px 18px; min-width: 230px; }
            .invoice-box h2 { margin: 0 0 8px; color: #1e40af; font-size: 22px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 22px 0; }
            .info-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; background: #f8fafc; }
            .info-card h3 { margin: 0 0 10px; color: #1e40af; font-size: 16px; }
            .line { display: flex; justify-content: space-between; margin: 7px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; overflow: hidden; border-radius: 14px; }
            th { background: #1e40af; color: white; padding: 12px; font-size: 13px; border: 1px solid #1e3a8a; }
            td { padding: 11px; text-align: center; border: 1px solid #e2e8f0; font-size: 13px; }
            tbody tr:nth-child(even) { background: #f8fafc; }
            .summary { display: flex; justify-content: flex-end; margin-top: 20px; }
            .totals { width: 330px; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
            .totals div { display: flex; justify-content: space-between; padding: 11px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .totals div:last-child { border-bottom: 0; }
            .grand { background: #1e40af; color: white; font-weight: bold; font-size: 17px !important; }
            .footer { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 35px; }
            .signature { width: 230px; text-align: center; border-top: 1px solid #334155; padding-top: 8px; color: #334155; }
            .thanks { text-align: center; color: #475569; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="brand">
                <img src="${storeLogo}" />
                <div>
                  <h1>${storeName}</h1>
                  <p>نظام مبيعات ومحاسبة</p>
                  ${storePhone ? `<p>الهاتف: ${storePhone}</p>` : ""}
                  ${storeAddress ? `<p>العنوان: ${storeAddress}</p>` : ""}
                </div>
              </div>
              <div class="invoice-box">
                <h2>SALES INVOICE</h2>
                <div><strong>No:</strong> ${invoiceNumber}</div>
                <div><strong>Date:</strong> ${safePrintText(invoice.date)}</div>
                <div><strong>Status:</strong> ${safePrintText(invoice.status || "مدفوعة")}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <h3>بيانات الزبون</h3>
                <div class="line"><span>الاسم</span><strong>${customerName}</strong></div>
                <div class="line"><span>نوع الفاتورة</span><strong>فاتورة مبيعات</strong></div>
              </div>
              <div class="info-card">
                <h3>ملخص الفاتورة</h3>
                <div class="line"><span>رقم الفاتورة</span><strong>${invoiceNumber}</strong></div>
                <div class="line"><span>التاريخ</span><strong>${safePrintText(invoice.date)}</strong></div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>الصنف</th>
                  <th>الباركود</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${(invoice.items || [])
                  .map(
                    (item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${safePrintText(item.name)}</td>
                        <td>${safePrintText(item.barcode || "-")}</td>
                        <td>${safePrintText(item.qty)}</td>
                        <td>₪ ${safePrintText(item.price)}</td>
                        <td>₪ ${safePrintText(item.total)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="summary">
              <div class="totals">
                <div><span>المجموع</span><strong>₪ ${safePrintText(total.toFixed(2))}</strong></div>
                <div><span>الخصم</span><strong>₪ ${safePrintText(discount.toFixed(2))}</strong></div>
                <div class="grand"><span>الصافي</span><strong>₪ ${safePrintText(grandTotal.toFixed(2))}</strong></div>
                <div><span>المدفوع</span><strong>₪ ${safePrintText(paidAmount.toFixed(2))}</strong></div>
                <div><span>المتبقي</span><strong>₪ ${safePrintText(remaining.toFixed(2))}</strong></div>
              </div>
            </div>

            <div class="footer">
              <div class="signature">توقيع المستلم</div>
              <div class="thanks">شكراً لتعاملكم معنا</div>
              <div class="signature">ختم المتجر</div>
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const filteredInvoices = salesInvoices.filter(
    (invoice) =>
      String(invoice.invoiceNumber || "").includes(invoiceSearch) ||
      (invoice.customerName || "")
        .toLowerCase()
        .includes((invoiceSearch || "").toLowerCase()) ||
      getInvoiceStatus(invoice).includes(invoiceSearch || "")
  );

  return (
    <>
      <h1>فواتير المبيعات</h1>

      <input
        value={invoiceSearch}
        onChange={(e) => setInvoiceSearch(e.target.value)}
        placeholder="بحث برقم الفاتورة أو اسم الزبون أو الحالة..."
        style={styles.input}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>رقم الفاتورة</th>
            <th style={styles.th}>التاريخ</th>
            <th style={styles.th}>الزبون</th>
            <th style={styles.th}>عدد الأصناف</th>
            <th style={styles.th}>الصافي</th>
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
                onClick={() => setSelectedInvoice(invoice)}
                style={{
                  cursor: "pointer",
                  opacity: invoiceStatus === "ملغاة" ? 0.55 : 1,
                  textDecoration: invoiceStatus === "ملغاة" ? "line-through" : "none",
                }}
              >
                <td style={styles.td}>{invoice.invoiceNumber}</td>
                <td style={styles.td}>{invoice.date}</td>
                <td style={styles.td}>{invoice.customerName || "زبون نقدي"}</td>
                <td style={styles.td}>{invoice.items?.length || 0}</td>
                <td style={styles.td}>₪ {invoice.grandTotal || invoice.total}</td>
                <td style={styles.td}>₪ {invoice.paidAmount || 0}</td>
                <td style={styles.td}>₪ {invoice.remaining || 0}</td>
                <td style={styles.td}>{invoice.status || "مدفوعة"}</td>
                <td style={styles.td}>
                  <span style={statusStyle(invoiceStatus)}>{invoiceStatus}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedInvoice && (
        <div style={styles.card}>
          <h2>تفاصيل الفاتورة #{selectedInvoice.invoiceNumber}</h2>

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
              {(selectedInvoice.items || []).map((item, index) => (
                <tr key={item.id || index}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>₪ {item.price}</td>
                  <td style={styles.td}>{item.qty}</td>
                  <td style={styles.td}>₪ {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>رقم الفاتورة: {selectedInvoice.invoiceNumber}</h3>
          <h3>التاريخ: {selectedInvoice.date}</h3>
          <h3>المجموع: ₪ {selectedInvoice.total}</h3>
          <h3>الخصم: ₪ {selectedInvoice.discount || 0}</h3>
          <h3>الصافي: ₪ {selectedInvoice.grandTotal || selectedInvoice.total}</h3>
          <h3>الزبون: {selectedInvoice.customerName || "زبون نقدي"}</h3>
          <h3>المدفوع: ₪ {selectedInvoice.paidAmount || 0}</h3>
          <h3>المتبقي: ₪ {selectedInvoice.remaining || 0}</h3>
          <h3>حالة السداد: {selectedInvoice.status || "مدفوعة"}</h3>
          <h3>
            حالة الفاتورة: <span style={statusStyle(getInvoiceStatus(selectedInvoice))}>{getInvoiceStatus(selectedInvoice)}</span>
          </h3>
          <h3>رأس المال: ₪ {selectedInvoice.capital || 0}</h3>
          <h3>الربح: ₪ {selectedInvoice.profit || 0}</h3>

          <button
            onClick={() => printThermalInvoice(selectedInvoice)}
            style={styles.printBtn}
          >
            طباعة حرارية
          </button>

          <button
            onClick={() => printA4Invoice(selectedInvoice)}
            style={{ ...styles.saveBtn, marginRight: "10px" }}
          >
            طباعة A4
          </button>

          {getInvoiceStatus(selectedInvoice) === "مسودة" && (
            <button
              onClick={() => approveSalesInvoice?.(selectedInvoice)}
              style={{
                ...(styles.saveBtn || styles.printBtn),
                marginRight: "10px",
                background: "#16a34a",
                color: "white",
              }}
            >
              اعتماد الفاتورة
            </button>
          )}

          {getInvoiceStatus(selectedInvoice) !== "ملغاة" && (
            <button
              onClick={() => cancelSalesInvoice?.(selectedInvoice)}
              style={{
                ...(styles.deleteBtn || styles.printBtn),
                marginRight: "10px",
                background: "#dc2626",
                color: "white",
              }}
            >
              إلغاء الفاتورة
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default SalesInvoices;
