import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function Reports({
  reportFromDate,
  setReportFromDate,
  reportToDate,
  setReportToDate,
  salesInvoices = [],
  styles,
}) {
  const formatMoney = (value) => `₪ ${Number(value || 0).toFixed(2)}`;

  const approvedInvoices = salesInvoices.filter(
    (invoice) =>
      (invoice.invoiceStatus || invoice.invoice_status || "معتمدة") === "معتمدة"
  );

  const invoices = approvedInvoices.filter((invoice) => {
    if (!reportFromDate && !reportToDate) return true;
    const date = invoice.date;
    if (reportFromDate && date < reportFromDate) return false;
    if (reportToDate && date > reportToDate) return false;
    return true;
  });

  const totalSales = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal || invoice.total || 0),
    0
  );

  const totalCapital = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.capital || 0),
    0
  );

  const totalProfit = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.profit || 0),
    0
  );

  const totalPaid = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.paidAmount || 0),
    0
  );

  const totalRemaining = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.remaining || 0),
    0
  );

  const averageInvoice = invoices.length ? totalSales / invoices.length : 0;
  const profitMargin = totalSales ? (totalProfit / totalSales) * 100 : 0;

  const productSummary = Object.values(
    invoices.reduce((acc, invoice) => {
      (invoice.items || []).forEach((item) => {
        const key = item.name || "غير معروف";
        if (!acc[key]) {
          acc[key] = { name: key, qty: 0, sales: 0, capital: 0, profit: 0 };
        }
        const qty = Number(item.qty || 0);
        const sales = Number(item.total || 0);
        const capital = Number(item.cost || 0) * qty;
        acc[key].qty += qty;
        acc[key].sales += sales;
        acc[key].capital += capital;
        acc[key].profit += sales - capital;
      });
      return acc;
    }, {})
  ).sort((a, b) => b.profit - a.profit);

  const customerSummary = Object.values(
    invoices.reduce((acc, invoice) => {
      const key = invoice.customerName || "زبون نقدي";
      if (!acc[key]) {
        acc[key] = { customer: key, count: 0, sales: 0, paid: 0, remaining: 0, profit: 0 };
      }
      acc[key].count += 1;
      acc[key].sales += Number(invoice.grandTotal || invoice.total || 0);
      acc[key].paid += Number(invoice.paidAmount || 0);
      acc[key].remaining += Number(invoice.remaining || 0);
      acc[key].profit += Number(invoice.profit || 0);
      return acc;
    }, {})
  ).sort((a, b) => b.sales - a.sales);

  const dailySummary = Object.values(
    invoices.reduce((acc, invoice) => {
      const key = invoice.date || "بدون تاريخ";
      if (!acc[key]) {
        acc[key] = { date: key, count: 0, sales: 0, capital: 0, profit: 0 };
      }
      acc[key].count += 1;
      acc[key].sales += Number(invoice.grandTotal || invoice.total || 0);
      acc[key].capital += Number(invoice.capital || 0);
      acc[key].profit += Number(invoice.profit || 0);
      return acc;
    }, {})
  ).sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const reportRows = invoices.map((invoice) => ({
    "رقم الفاتورة": invoice.invoiceNumber,
    "التاريخ": invoice.date,
    "الزبون": invoice.customerName || "زبون نقدي",
    "المبيعات": Number(invoice.grandTotal || invoice.total || 0),
    "رأس المال": Number(invoice.capital || 0),
    "الربح": Number(invoice.profit || 0),
    "المدفوع": Number(invoice.paidAmount || 0),
    "المتبقي": Number(invoice.remaining || 0),
    "حالة السداد": invoice.status || "مدفوعة",
  }));

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportRows), "Invoices");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dailySummary), "Daily Profit");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(productSummary), "Products");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(customerSummary), "Customers");
    XLSX.writeFile(workbook, `hisabati-profit-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.setFontSize(18);
    pdf.text("Hisabati Profit Report", 14, 16);
    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date().toLocaleString()}`, 14, 24);
    pdf.text(`Range: ${reportFromDate || "All"} - ${reportToDate || "All"}`, 14, 30);

    const summary = [
      ["Invoices", invoices.length],
      ["Total Sales", totalSales.toFixed(2)],
      ["Capital", totalCapital.toFixed(2)],
      ["Profit", totalProfit.toFixed(2)],
      ["Profit Margin", `${profitMargin.toFixed(2)}%`],
      ["Paid", totalPaid.toFixed(2)],
      ["Remaining", totalRemaining.toFixed(2)],
    ];

    let y = 42;
    summary.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 14, y);
      y += 7;
    });

    y += 5;
    pdf.setFontSize(12);
    pdf.text("Invoices", 14, y);
    y += 8;
    pdf.setFontSize(8);
    pdf.text("No", 14, y);
    pdf.text("Date", 34, y);
    pdf.text("Customer", 60, y);
    pdf.text("Sales", 120, y);
    pdf.text("Capital", 145, y);
    pdf.text("Profit", 170, y);
    pdf.text("Paid", 195, y);
    pdf.text("Remaining", 220, y);
    y += 5;

    invoices.slice(0, 24).forEach((invoice) => {
      if (y > 190) {
        pdf.addPage();
        y = 16;
      }
      pdf.text(String(invoice.invoiceNumber || ""), 14, y);
      pdf.text(String(invoice.date || ""), 34, y);
      pdf.text(String(invoice.customerName || "Cash"), 60, y, { maxWidth: 55 });
      pdf.text(Number(invoice.grandTotal || invoice.total || 0).toFixed(2), 120, y);
      pdf.text(Number(invoice.capital || 0).toFixed(2), 145, y);
      pdf.text(Number(invoice.profit || 0).toFixed(2), 170, y);
      pdf.text(Number(invoice.paidAmount || 0).toFixed(2), 195, y);
      pdf.text(Number(invoice.remaining || 0).toFixed(2), 220, y);
      y += 6;
    });

    pdf.save(`hisabati-profit-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <h1>تقارير الأرباح المتقدمة</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input type="date" value={reportFromDate} onChange={(e) => setReportFromDate(e.target.value)} style={styles.input} />
        <input type="date" value={reportToDate} onChange={(e) => setReportToDate(e.target.value)} style={styles.input} />
        <button style={styles.saveBtn} onClick={exportExcel}>تصدير Excel</button>
        <button style={styles.printBtn} onClick={exportPDF}>تصدير PDF</button>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}><h3>عدد الفواتير</h3><p>{invoices.length}</p></div>
        <div style={styles.card}><h3>إجمالي المبيعات</h3><p>{formatMoney(totalSales)}</p></div>
        <div style={styles.card}><h3>إجمالي رأس المال</h3><p>{formatMoney(totalCapital)}</p></div>
        <div style={styles.card}><h3>صافي الربح</h3><p>{formatMoney(totalProfit)}</p></div>
        <div style={styles.card}><h3>هامش الربح</h3><p>{profitMargin.toFixed(2)}%</p></div>
        <div style={styles.card}><h3>متوسط الفاتورة</h3><p>{formatMoney(averageInvoice)}</p></div>
        <div style={styles.card}><h3>المدفوع</h3><p>{formatMoney(totalPaid)}</p></div>
        <div style={styles.card}><h3>المتبقي</h3><p>{formatMoney(totalRemaining)}</p></div>
      </div>

      <div style={styles.card}>
        <h2>تفاصيل الفواتير</h2>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>رقم الفاتورة</th><th style={styles.th}>التاريخ</th><th style={styles.th}>الزبون</th><th style={styles.th}>المبيعات</th><th style={styles.th}>رأس المال</th><th style={styles.th}>الربح</th><th style={styles.th}>هامش الربح</th></tr></thead>
          <tbody>
            {invoices.map((invoice) => {
              const sales = Number(invoice.grandTotal || invoice.total || 0);
              const profit = Number(invoice.profit || 0);
              return <tr key={invoice.id}><td style={styles.td}>{invoice.invoiceNumber}</td><td style={styles.td}>{invoice.date}</td><td style={styles.td}>{invoice.customerName || "زبون نقدي"}</td><td style={styles.td}>{formatMoney(sales)}</td><td style={styles.td}>{formatMoney(invoice.capital)}</td><td style={styles.td}>{formatMoney(profit)}</td><td style={styles.td}>{sales ? ((profit / sales) * 100).toFixed(2) : "0.00"}%</td></tr>;
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.card}>
        <h2>أرباح حسب اليوم</h2>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>التاريخ</th><th style={styles.th}>عدد الفواتير</th><th style={styles.th}>المبيعات</th><th style={styles.th}>رأس المال</th><th style={styles.th}>الربح</th></tr></thead>
          <tbody>{dailySummary.map((row) => <tr key={row.date}><td style={styles.td}>{row.date}</td><td style={styles.td}>{row.count}</td><td style={styles.td}>{formatMoney(row.sales)}</td><td style={styles.td}>{formatMoney(row.capital)}</td><td style={styles.td}>{formatMoney(row.profit)}</td></tr>)}</tbody>
        </table>
      </div>

      <div style={styles.card}>
        <h2>أفضل المنتجات ربحًا</h2>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>المنتج</th><th style={styles.th}>الكمية</th><th style={styles.th}>المبيعات</th><th style={styles.th}>رأس المال</th><th style={styles.th}>الربح</th></tr></thead>
          <tbody>{productSummary.slice(0, 20).map((row) => <tr key={row.name}><td style={styles.td}>{row.name}</td><td style={styles.td}>{row.qty}</td><td style={styles.td}>{formatMoney(row.sales)}</td><td style={styles.td}>{formatMoney(row.capital)}</td><td style={styles.td}>{formatMoney(row.profit)}</td></tr>)}</tbody>
        </table>
      </div>

      <div style={styles.card}>
        <h2>المبيعات حسب الزبون</h2>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>الزبون</th><th style={styles.th}>عدد الفواتير</th><th style={styles.th}>المبيعات</th><th style={styles.th}>المدفوع</th><th style={styles.th}>المتبقي</th><th style={styles.th}>الربح</th></tr></thead>
          <tbody>{customerSummary.slice(0, 20).map((row) => <tr key={row.customer}><td style={styles.td}>{row.customer}</td><td style={styles.td}>{row.count}</td><td style={styles.td}>{formatMoney(row.sales)}</td><td style={styles.td}>{formatMoney(row.paid)}</td><td style={styles.td}>{formatMoney(row.remaining)}</td><td style={styles.td}>{formatMoney(row.profit)}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export default Reports;
