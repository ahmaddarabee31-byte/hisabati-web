function Suppliers({
  supplierName,
  setSupplierName,
  supplierPhone,
  setSupplierPhone,
  supplierAddress,
  setSupplierAddress,
  saveSupplier,
  supplierSearch,
  setSupplierSearch,
  suppliers,
  styles,
  editingSupplier,
  setEditingSupplier,
  updateSupplier,
}) {
  return (
    <>
      <h1>الموردين</h1>

      <div style={styles.formCard}>
        <input
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="اسم المورد"
          style={styles.input}
        />

        <input
          value={supplierPhone}
          onChange={(e) => setSupplierPhone(e.target.value)}
          placeholder="رقم الجوال"
          style={styles.input}
        />

        <input
          value={supplierAddress}
          onChange={(e) => setSupplierAddress(e.target.value)}
          placeholder="العنوان"
          style={styles.input}
        />

        <button style={styles.saveBtn} onClick={saveSupplier}>
          حفظ المورد
        </button>

        <input
          value={supplierSearch}
          onChange={(e) => setSupplierSearch(e.target.value)}
          placeholder="ابحث عن مورد..."
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
          {suppliers
            .filter(
              (s) =>
                s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                (s.phone || "").includes(supplierSearch) ||
                (s.address || "")
                  .toLowerCase()
                  .includes(supplierSearch.toLowerCase())
            )
            .map((s) => (
              <tr key={s.id}>
                <td style={styles.td}>{s.name}</td>
                <td style={styles.td}>{s.phone}</td>
                <td style={styles.td}>{s.address}</td>
                <td style={styles.td}>
  <button
    style={styles.editBtn}
    onClick={() => setEditingSupplier(s)}
  >
    تعديل
  </button>
</td>
              </tr>
            ))}
        </tbody>
      </table>
      {editingSupplier && (
  <div style={styles.card}>
    <h2>تعديل بيانات المورد</h2>

    <input
      value={editingSupplier.name}
      onChange={(e) =>
        setEditingSupplier({
          ...editingSupplier,
          name: e.target.value,
        })
      }
      placeholder="اسم المورد"
      style={styles.input}
    />

    <input
      value={editingSupplier.phone}
      onChange={(e) =>
        setEditingSupplier({
          ...editingSupplier,
          phone: e.target.value,
        })
      }
      placeholder="رقم الجوال"
      style={styles.input}
    />

    <input
      value={editingSupplier.address}
      onChange={(e) =>
        setEditingSupplier({
          ...editingSupplier,
          address: e.target.value,
        })
      }
      placeholder="العنوان"
      style={styles.input}
    />

    <button
      style={styles.saveBtn}
      onClick={() => updateSupplier(editingSupplier)}
    >
      حفظ التعديل
    </button>
  </div>
)}
    </>
  );
}

export default Suppliers;