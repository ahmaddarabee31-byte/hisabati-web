function Customers({
saveCustomer,
updateCustomer,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customers,
  setCustomers,
  customerSearch,
  setCustomerSearch,
  selectedCustomerAccount,
  setSelectedCustomerAccount,
  sanitizeText,
  safeParseArray,
  styles,
  editingCustomer,
setEditingCustomer,
}) {
  return (
    <>
      <h1>الزبائن</h1>

      <div style={styles.card}>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="اسم الزبون"
          style={styles.input}
        />

        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="رقم الجوال"
          style={styles.input}
        />

        <input
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="العنوان"
          style={styles.input}
        />

        <button
          onClick={saveCustomer}
        >
          حفظ الزبون
        </button>

        <input
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="ابحث عن زبون..."
          style={styles.input}
        />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>الاسم</th>
            <th style={styles.th}>الجوال</th>
            <th style={styles.th}>العنوان</th>
            <th style={styles.th}>تعديل</th>
          </tr>
        </thead>

        <tbody>
          {customers
            .filter(
              (c) =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                (c.phone || "").includes(customerSearch) ||
                (c.address || "")
                  .toLowerCase()
                  .includes(customerSearch.toLowerCase())
            )
            .map((c) => (
              <tr key={c.id}>
                <td
                  style={{
                    ...styles.td,
                    cursor: "pointer",
                    color: "#2563eb",
                    fontWeight: "bold",
                  }}
                  onClick={() => setSelectedCustomerAccount(c)}
                >
                  {c.name}
                </td>
                <td style={styles.td}>{c.phone}</td>
                <td style={styles.td}>{c.address}</td>
                <td style={styles.td}>
  <button
    style={styles.editBtn}
    onClick={() => setEditingCustomer(c)}
  >
    تعديل
  </button>
</td>
              </tr>
            ))}
        </tbody>
      </table>
      {editingCustomer && (
  <div style={styles.card}>
    <h2>تعديل بيانات الزبون</h2>

    <input
      value={editingCustomer.name}
      onChange={(e) =>
        setEditingCustomer({ ...editingCustomer, name: e.target.value })
      }
      placeholder="اسم الزبون"
      style={styles.input}
    />

    <input
      value={editingCustomer.phone}
      onChange={(e) =>
        setEditingCustomer({ ...editingCustomer, phone: e.target.value })
      }
      placeholder="رقم الجوال"
      style={styles.input}
    />

    <input
      value={editingCustomer.address}
      onChange={(e) =>
        setEditingCustomer({ ...editingCustomer, address: e.target.value })
      }
      placeholder="العنوان"
      style={styles.input}
    />

    <button
      style={styles.saveBtn}
      onClick={() => updateCustomer(editingCustomer)}
    >
      حفظ التعديل
    </button>
  </div>
)}

      {/* كشف الحساب تم نقله لصفحة كشف حساب الزبائن حتى لا يتم الاعتماد على localStorage */}

    </>
  );
}

export default Customers;