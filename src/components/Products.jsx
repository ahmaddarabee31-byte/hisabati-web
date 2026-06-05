function Products({
  productName,
  setProductName,
  barcodeType,
  setBarcodeType,
  singleBarcode,
  setSingleBarcode,
  barcodes,
  updateBarcode,
  removeBarcode,
  addBarcode,
  category,
  setCategory,
  categories,
  newCategory,
  setNewCategory,
  brand,
  setBrand,
  description,
  setDescription,
  salePrice,
  setSalePrice,
  purchasePrice,
  setPurchasePrice,
  quantity,
  setQuantity,
  saveProduct,
  productSearch,
  setProductSearch,
  products,
  editProduct,
  deleteProduct,
  styles,
}) {
  return (
    <>
      <h1>إدارة المنتجات</h1>

      <div style={{ background: "white", padding: 25, borderRadius: 15 }}>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="اسم المنتج"
                style={styles.input}
              />
              <div style={{ marginBottom: 15 }}>
                <label>
                  <input
                    type="radio"
                    name="barcodeType"
                    value="single"
                    checked={barcodeType === "single"}
                    onChange={() => setBarcodeType("single")}
                  />
                  باركود واحد
                </label>

                <label style={{ marginRight: 25 }}>
                  <input
                    type="radio"
                    name="barcodeType"
                    value="multiple"
                    checked={barcodeType === "multiple"}
                    onChange={() => setBarcodeType("multiple")}
                  />
                  باركودات متعددة
                </label>
              </div>

              {barcodeType === "single" && (
                <input
                  value={singleBarcode}
                  onChange={(e) => setSingleBarcode(e.target.value)}
                  placeholder="الباركود"
                  style={styles.input}
                />
              )}
              {barcodeType === "multiple" && (
                <>
                  {barcodes.map((barcode, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={barcode}
                        onChange={(e) => updateBarcode(index, e.target.value)}
                        placeholder={`باركود ${index + 1}`}
                        style={styles.input}
                      />

                      <button
                        type="button"
                        onClick={() => removeBarcode(index)}
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "12px 18px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBarcode}
                    type="button"
                    style={styles.saveBtn}
                  >
                    + إضافة باركود
                  </button>
                </>
              )}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.input}
              >
                <option value="">اختر التصنيف</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

                <option value="other">أخرى</option>
              </select>

              {category === "other" && (
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="أدخل اسم التصنيف الجديد"
                  style={styles.input}
                />
              )}
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="العلامة التجارية"
                style={styles.input}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المنتج"
                style={styles.textarea}
              ></textarea>

              <input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="سعر البيع"
                style={styles.input}
              />

              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="سعر الشراء"
                style={styles.input}
              />

              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="الكمية"
                style={styles.input}
              />
              <button style={styles.saveBtn} onClick={saveProduct}>
                حفظ المنتج
              </button>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="بحث عن منتج أو باركود..."
                style={styles.input}
              />
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>المنتج</th>
                    <th style={styles.th}>التصنيف</th>
                    <th style={styles.th}>الوصف</th>
                    <th style={styles.th}>الباركودات</th>
                    <th style={styles.th}>العلامة التجارية</th>
                    <th style={styles.th}>سعر البيع</th>
                    <th style={styles.th}>الكمية</th>
                    <th style={styles.th}>تعديل</th>
                    <th style={styles.th}>حذف</th>
                  </tr>
                </thead>


                <tbody>
                  {products
                    .filter((p) =>
                      (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
                      (p.category || "").toLowerCase().includes(productSearch.toLowerCase()) ||
                      (p.brand || "")
                        .toLowerCase()
                        .includes(productSearch.toLowerCase()) ||
                      (p.barcodes || []).join(" ").includes(productSearch)
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td style={styles.td}>{p.name}</td>
                        <td style={styles.td}>{p.category}</td>
                        <td style={styles.td}>{p.description}</td>
                        <td style={styles.td}>{(p.barcodes || []).join(" / ")}</td>
                        <td style={styles.td}>{p.brand}</td>
                        <td style={styles.td}>{p.salePrice}</td>
                        <td style={styles.td}>{p.quantity}</td>

                        <td>
                          <button onClick={() => editProduct(p)}>
                            تعديل
                          </button>
                        </td>

                        <td>
                          <button
                            onClick={() => deleteProduct(p)}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>

              </table>
            </div>
          </>
        
  );
}

export default Products;