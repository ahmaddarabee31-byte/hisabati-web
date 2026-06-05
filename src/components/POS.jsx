import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

function POS({
  products = [],
  customers = [],
  salesInvoices = [],
  supabase,
  reloadAccountingData,
  storeSettings,
}) {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const total = cart.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const grandTotal = Math.max(total - Number(discount || 0), 0);
  const remaining = grandTotal - Number(paidAmount || 0);

  const capital = cart.reduce(
    (sum, item) => sum + Number(item.cost || 0) * Number(item.qty || 0),
    0
  );

  const profit = grandTotal - capital;

  const nextInvoiceNumber = useMemo(() => {
    return salesInvoices.length > 0
      ? Math.max(...salesInvoices.map((i) => Number(i.invoiceNumber || 0))) + 1
      : 1;
  }, [salesInvoices]);

  const qrText = `
فاتورة رقم: ${nextInvoiceNumber}
الزبون: ${selectedCustomer?.name || "زبون نقدي"}
المبلغ: ${grandTotal}
`;

  const addProductToCart = (product) => {
    if (Number(product.quantity || 0) <= 0) {
      return alert("المنتج غير متوفر في المخزون");
    }

    const existing = cart.find((item) => item.id === product.id);
    const existingQty = existing?.qty || 0;

    if (existingQty + 1 > Number(product.quantity || 0)) {
      return alert("الكمية غير متوفرة في المخزون");
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                total: (item.qty + 1) * Number(item.price),
              }
            : item
        )
      );
      return;
    }

    setCart([
      ...cart,
      {
        id: product.id,
        name: product.name,
        barcode: product.barcodes?.[0] || "",
        price: Number(product.salePrice || 0),
        cost: Number(product.purchasePrice || 0),
        qty: 1,
        total: Number(product.salePrice || 0),
      },
    ]);
  };

  const addByBarcode = (e) => {
    e.preventDefault();

    const product = products.find((p) =>
      (p.barcodes || []).includes(barcode.trim())
    );

    if (!product) {
      alert("الباركود غير موجود");
      setBarcode("");
      inputRef.current?.focus();
      return;
    }

    addProductToCart(product);
    setBarcode("");
    inputRef.current?.focus();
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQty = (id, value) => {
    const qty = Number(value);
    if (qty < 1) return;

    const product = products.find((p) => p.id === id);

    if (product && qty > Number(product.quantity || 0)) {
      alert("الكمية غير متوفرة في المخزون");
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty,
              total: qty * Number(item.price || 0),
            }
          : item
      )
    );
  };

  const updatePrice = (id, value) => {
    const price = Number(value);
    if (price < 0) return;

    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              price,
              total: price * Number(item.qty || 0),
            }
          : item
      )
    );
  };

  const buildInvoiceHtml = async (paperType = "thermal") => {
    const qrImage = await QRCode.toDataURL(qrText);
    const isA4 = paperType === "a4";
    const storeName = storeSettings?.storeName || "حساباتي";
    const storePhone = storeSettings?.phone || "";
    const storeAddress = storeSettings?.address || "";
    const storeLogo = storeSettings?.logo || "/logo-hisabati.png";

    return `
      <html>
        <head>
          <title>فاتورة ${nextInvoiceNumber}</title>
          <style>
            @page { size: ${isA4 ? "A4" : "80mm auto"}; margin: ${isA4 ? "14mm" : "3mm"}; }
            body {
              width: ${isA4 ? "auto" : "80mm"};
              font-family: Tahoma, Arial;
              direction: rtl;
              color: #111827;
              padding: ${isA4 ? "0" : "8px"};
              font-size: ${isA4 ? "14px" : "12px"};
            }
            .invoice {
              max-width: ${isA4 ? "760px" : "80mm"};
              margin: auto;
            }
            .header {
              display: ${isA4 ? "flex" : "block"};
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #111827;
              padding-bottom: 12px;
              text-align: ${isA4 ? "right" : "center"};
            }
            .logo { width: ${isA4 ? "95px" : "78px"}; display:block; margin:${isA4 ? "0" : "0 auto 8px"}; }
            h1,h2,p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background:#f1f5f9; }
            th, td { border: 1px solid ${isA4 ? "#cbd5e1" : "#000"}; padding: ${isA4 ? "9px" : "4px"}; text-align: center; font-size: ${isA4 ? "13px" : "11px"}; }
            .thermal th, .thermal td { border-left:0; border-right:0; border-top:0; border-bottom:1px dashed #000; }
            .totals { margin-top: 16px; margin-right: auto; width: ${isA4 ? "310px" : "100%"}; }
            .row { display:flex; justify-content:space-between; padding: 5px 0; border-bottom: 1px solid #e5e7eb; }
            .grand { font-weight:bold; font-size:${isA4 ? "18px" : "14px"}; }
            .footer { text-align:center; margin-top:18px; }
          </style>
        </head>
        <body>
          <div class="invoice ${isA4 ? "" : "thermal"}">
            <div class="header">
              <div>
                <img src="${storeLogo}" class="logo" />
                <h2>${storeName}</h2>
                ${storePhone ? `<p>الهاتف: ${storePhone}</p>` : ""}
                ${storeAddress ? `<p>العنوان: ${storeAddress}</p>` : ""}
                <p>فاتورة مبيعات</p>
              </div>
              <div>
                <p><strong>رقم الفاتورة:</strong> ${nextInvoiceNumber}</p>
                <p><strong>التاريخ:</strong> ${invoiceDate}</p>
                <p><strong>الزبون:</strong> ${selectedCustomer?.name || "زبون نقدي"}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${cart
                  .map(
                    (item) => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.qty}</td>
                        <td>${item.price}</td>
                        <td>${item.total}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="totals">
              <div class="row"><span>المجموع</span><span>₪ ${total}</span></div>
              <div class="row"><span>الخصم</span><span>₪ ${discount}</span></div>
              <div class="row grand"><span>الصافي</span><span>₪ ${grandTotal}</span></div>
              <div class="row"><span>المدفوع</span><span>₪ ${paidAmount}</span></div>
              <div class="row"><span>المتبقي</span><span>₪ ${remaining}</span></div>
            </div>

            <div class="footer">
              <img src="${qrImage}" style="width:${isA4 ? "115px" : "95px"};" />
              <p>شكراً لزيارتكم</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function(){ window.close(); }, 300);
            };
          </script>
        </body>
      </html>
    `;
  };

  const printInvoice = async (paperType = "thermal") => {
    if (cart.length === 0) return alert("الفاتورة فارغة");
    const printWindow = window.open("", "", paperType === "a4" ? "width=900,height=700" : "width=320,height=650");
    printWindow.document.write(await buildInvoiceHtml(paperType));
    printWindow.document.close();
  };

  const saveInvoice = async (invoiceStatus = "معتمدة") => {
    if (cart.length === 0) {
      alert("الفاتورة فارغة");
      return;
    }

    if (Number(paidAmount || 0) < 0) {
      return alert("المبلغ المدفوع غير صحيح");
    }

    if (Number(discount || 0) < 0 || Number(discount || 0) > total) {
      return alert("قيمة الخصم غير صحيحة");
    }

    const invoicePayload = {
      invoice_number: nextInvoiceNumber,
      date: invoiceDate,
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.name || "زبون نقدي",
      total,
      discount: Number(discount || 0),
      grand_total: grandTotal,
      capital,
      profit,
      paid_amount: Number(paidAmount || 0),
      remaining,
      status: remaining > 0 ? "دين" : "مدفوعة",
      invoice_status: invoiceStatus,
    };

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("sales_invoices")
      .insert([invoicePayload])
      .select()
      .single();

    if (invoiceError) {
      console.error(invoiceError);
      return alert("خطأ في حفظ الفاتورة");
    }

    const invoiceItems = cart.map((item) => ({
      invoice_id: invoiceData.id,
      product_id: item.id,
      product_name: item.name,
      barcode: item.barcode || "",
      quantity: Number(item.qty || 0),
      sale_price: Number(item.price || 0),
      purchase_price: Number(item.cost || 0),
      total: Number(item.total || 0),
    }));

    const { error: itemsError } = await supabase
      .from("sales_invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      console.error(itemsError);
      return alert("تم حفظ الفاتورة لكن حدث خطأ في حفظ الأصناف");
    }

    if (invoiceStatus === "معتمدة") {
      for (const item of cart) {
        const product = products.find((p) => p.id === item.id);
        if (!product) continue;

        const newQuantity = Number(product.quantity || 0) - Number(item.qty || 0);

        const { error: stockError } = await supabase
          .from("products")
          .update({ quantity: newQuantity })
          .eq("id", item.id);

        if (stockError) {
          console.error(stockError);
          return alert("تم حفظ الفاتورة لكن حدث خطأ في تحديث المخزون");
        }
      }
    }

    await reloadAccountingData?.();

    alert(invoiceStatus === "مسودة" ? "تم حفظ الفاتورة كمسودة" : "تم اعتماد وحفظ الفاتورة بنجاح");
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
    setSelectedCustomerId("");
  };

  return (
    <div dir="rtl" style={styles.page}>
      <h1>نقطة البيع</h1>

      <form onSubmit={addByBarcode} style={styles.barcodeBox}>
        <input
          ref={inputRef}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="امسح الباركود هنا"
          style={styles.barcodeInput}
        />

        <button style={styles.addBtn}>إضافة بالباركود</button>
      </form>

      <div style={styles.barcodeBox}>
        <input
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="ابحث باسم المنتج..."
          style={styles.barcodeInput}
        />

        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          style={styles.barcodeInput}
        >
          <option value="">اختر المنتج</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - ₪ {p.salePrice} - الكمية {p.quantity}
            </option>
          ))}
        </select>

        <button
          type="button"
          style={styles.addBtn}
          onClick={() => {
            const product = products.find((p) => p.id === selectedProductId);

            if (!product) return alert("اختر المنتج");

            addProductToCart(product);
            setSelectedProductId("");
          }}
        >
          إضافة المنتج
        </button>
      </div>

      {productSearch && (
        <div style={styles.totalBox}>
          {products
            .filter(
              (p) =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.barcodes || []).some((b) => b.includes(productSearch))
            )
            .slice(0, 10)
            .map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  fontSize: "18px",
                }}
                onClick={() => {
                  addProductToCart(p);
                  setProductSearch("");
                }}
              >
                <strong>{p.name}</strong> - ₪ {p.salePrice}

                <br />

                <span style={{ color: "#64748b", fontSize: "14px" }}>
                  التصنيف: {p.category || "غير مصنف"}
                </span>

                <br />

                المتوفر:
                <span
                  style={{
                    color:
                      Number(p.quantity) <= 0
                        ? "red"
                        : Number(p.quantity) <= 5
                        ? "orange"
                        : "green",
                    fontWeight: "bold",
                    marginRight: "8px",
                  }}
                >
                  {p.quantity}
                </span>
              </div>
            ))}
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>السعر</th>
            <th>الكمية</th>
            <th>المجموع</th>
            <th>المخزون</th>
            <th>حذف</th>
          </tr>
        </thead>

        <tbody>
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.id);

            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updatePrice(item.id, e.target.value)}
                    style={{
                      width: "90px",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, e.target.value)}
                    style={{
                      width: "80px",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  />
                </td>
                <td>{item.total}</td>
                <td>{product?.quantity || 0}</td>
                <td>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={styles.deleteBtn}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={styles.totalBox}>
        <div style={styles.summaryBox}>
          <label style={styles.formLabel}>الزبون</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            style={styles.discountInput}
          >
            <option value="">زبون نقدي</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.phone}
              </option>
            ))}
          </select>

          <label style={styles.formLabel}>المبلغ المدفوع</label>
          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            placeholder="المبلغ المدفوع"
            style={styles.discountInput}
          />

          <label style={styles.formLabel}>تاريخ الفاتورة</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            style={styles.discountInput}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: "320px",
              margin: "10px auto",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            <span>المدفوع</span>
            <span>₪ {paidAmount}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: "320px",
              margin: "10px auto 20px",
              fontWeight: "bold",
              fontSize: "20px",
              color: remaining > 0 ? "#dc2626" : "#16a34a",
            }}
          >
            <span>المتبقي</span>
            <span>₪ {remaining}</span>
          </div>

          <label style={styles.formLabel}>الخصم</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="أدخل الخصم"
            style={styles.discountInput}
          />

          <div style={styles.totalsText}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>المجموع</span>
              <span>₪ {total}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>الخصم</span>
              <span>₪ {discount}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "22px",
                marginTop: "10px",
              }}
            >
              <span>الصافي</span>
              <span>₪ {grandTotal}</span>
            </div>
          </div>

          <div style={styles.buttonsRow}>
            <button
              onClick={() => saveInvoice("مسودة")}
              style={styles.draftBtn}
            >
              حفظ كمسودة
            </button>

            <button
              onClick={() => saveInvoice("معتمدة")}
              style={styles.saveBtn}
            >
              اعتماد وحفظ
            </button>

                        <button
              type="button"
              style={styles.printBtn}
              onClick={() => printInvoice("thermal")}
            >
              طباعة حرارية
            </button>

            <button
              type="button"
              style={styles.printBtn}
              onClick={() => printInvoice("a4")}
            >
              طباعة A4
            </button>

            <button onClick={() => setCart([])} style={styles.clearBtn}>
              تفريغ الفاتورة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 30, fontFamily: "Tahoma" },

  barcodeBox: {
    display: "flex",
    gap: 10,
    marginBottom: 25,
  },

  barcodeInput: {
    flex: 1,
    padding: 18,
    fontSize: 22,
    borderRadius: 10,
    border: "1px solid #ddd",
  },

  addBtn: {
    padding: "0 35px",
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 10,
    fontSize: 18,
    cursor: "pointer",
  },

  table: {
    width: "100%",
    background: "white",
    borderCollapse: "collapse",
    fontSize: 18,
  },

  totalBox: {
    marginTop: 25,
    background: "white",
    padding: 25,
    borderRadius: 14,
  },

  deleteBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  buttonsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  summaryBox: {
    maxWidth: "520px",
    margin: "0 auto",
    textAlign: "center",
  },

  formLabel: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#334155",
  },

  discountInput: {
    width: "100%",
    maxWidth: "280px",
    padding: "12px",
    fontSize: "18px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    marginBottom: "14px",
    textAlign: "center",
    boxSizing: "border-box",
  },

  totalsText: {
    marginBottom: "20px",
    background: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    margin: "15px auto 20px",
    maxWidth: "320px",
    lineHeight: "1.8",
  },

  draftBtn: {
    background: "#f59e0b",
    color: "white",
    border: 0,
    padding: "14px 26px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    minWidth: "120px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },

  saveBtn: {
    background: "#16a34a",
    color: "white",
    border: 0,
    padding: "14px 26px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    minWidth: "120px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },

  printBtn: {
    background: "#0f172a",
    color: "white",
    border: 0,
    padding: "14px 26px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    minWidth: "120px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },

  clearBtn: {
    background: "#7f1d1d",
    color: "white",
    border: "none",
    padding: "14px 26px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    minWidth: "120px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
};

export default POS;
