import { useState } from "react";
import * as XLSX from "xlsx";

function Settings({
  products = [],
  customers = [],
  suppliers = [],
  salesInvoices = [],
  purchaseInvoices = [],
  customerPayments = [],
  supplierPayments = [],
  users = [],
  setUsers,
  loadUsers,
  currentUser,
  supabase,
  auditLogs = [],
  addAuditLog,
  clearAuditLogs,
  storeSettings,
  setStoreSettings,
  styles,
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("cashier");

  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("cashier");

  const [storeName, setStoreName] = useState(storeSettings?.storeName || "");
  const [storePhone, setStorePhone] = useState(storeSettings?.phone || "");
  const [storeAddress, setStoreAddress] = useState(storeSettings?.address || "");
  const [storeLogo, setStoreLogo] = useState(storeSettings?.logo || "/logo-hisabati.png");

  const isAdmin = currentUser?.role === "admin";

  const activeAdmins = users.filter((u) => u.role === "admin" && u.active !== false);

  const refreshUsers = async () => {
    if (typeof loadUsers === "function") {
      await loadUsers();
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("id", { ascending: true });

      if (!error) {
        setUsers?.((data || []).map((u) => ({
          id: u.id,
          username: u.username,
          password: u.password,
          role: u.role || "cashier",
          active: u.active !== false,
          createdAt: u.created_at || null,
        })));
      }
    }
  };

  const exportAuditLogsExcel = () => {
    const rows = auditLogs.map((log) => ({
      التاريخ: log.date,
      المستخدم: log.user,
      الصلاحية: roleLabel(log.role),
      العملية: log.action,
      التفاصيل: log.details,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Audit Logs");
    XLSX.writeFile(workbook, `hisabati-audit-log-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const roleLabel = (role) => {
    if (role === "admin") return "مدير";
    if (role === "accountant") return "محاسب";
    if (role === "cashier") return "كاشير";
    return role;
  };

  const exportBackup = async () => {
    const backup = {
      app: "hisabati",
      version: 2,
      exportedAt: new Date().toISOString(),
      source: supabase ? "supabase" : "current-state",
      localData: {
        products,
        customers,
        suppliers,
        salesInvoices,
        purchaseInvoices,
        customerPayments,
        supplierPayments,
        users: users.map(({ password, ...user }) => ({ ...user, password: "hidden" })),
        auditLogs,
        storeSettings,
      },
    };

    if (supabase) {
      const tables = [
        "products",
        "customers",
        "suppliers",
        "sales_invoices",
        "sales_invoice_items",
        "purchase_invoices",
        "customer_payments",
        "supplier_payments",
      ];

      backup.supabaseTables = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          console.error(error);
          return alert(`فشل تصدير جدول ${table}`);
        }
        backup.supabaseTables[table] = data || [];
      }
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hisabati-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportBackupExcel = async () => {
    const workbook = XLSX.utils.book_new();
    const append = (name, rows) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows || []), name);

    if (supabase) {
      const tables = [
        "products",
        "customers",
        "suppliers",
        "sales_invoices",
        "sales_invoice_items",
        "purchase_invoices",
        "customer_payments",
        "supplier_payments",
      ];
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) return alert(`فشل تصدير جدول ${table}`);
        append(table, data || []);
      }
    } else {
      append("products", products);
      append("customers", customers);
      append("suppliers", suppliers);
      append("salesInvoices", salesInvoices);
      append("purchaseInvoices", purchaseInvoices);
      append("customerPayments", customerPayments);
      append("supplierPayments", supplierPayments);
    }
    append("users", users.map(({ password, ...user }) => ({ ...user, password: "hidden" })));
    XLSX.writeFile(workbook, `hisabati-backup-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const changePassword = async () => {
    if (!currentUser) return alert("يجب تسجيل الدخول أولاً");
    if (!oldPassword || !newPassword || !confirmPassword) return alert("أكمل بيانات تغيير كلمة المرور");
    if (newPassword.length < 4) return alert("كلمة المرور يجب أن تكون 4 خانات على الأقل");
    if (newPassword !== confirmPassword) return alert("كلمة المرور الجديدة غير متطابقة");

    const { data: user, error: readError } = await supabase
      .from("users")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (readError) {
      console.error(readError);
      return alert("خطأ في قراءة بيانات المستخدم");
    }

    if (!user || user.password !== oldPassword) return alert("كلمة المرور الحالية غير صحيحة");

    const { error } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("id", currentUser.id);

    if (error) {
      console.error(error);
      return alert("خطأ في تغيير كلمة المرور");
    }

    await refreshUsers();
    addAuditLog?.("تغيير كلمة مرور", `قام المستخدم ${currentUser.username} بتغيير كلمة المرور الخاصة به`);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("تم تغيير كلمة المرور بنجاح");
  };

  const addUser = async () => {
    if (!isAdmin) return alert("هذه الصلاحية للمدير فقط");
    const username = newUsername.trim();
    if (!username || !newUserPassword) return alert("أدخل اسم المستخدم وكلمة المرور");
    if (newUserPassword.length < 4) return alert("كلمة المرور يجب أن تكون 4 خانات على الأقل");
    if (users.some((u) => u.username === username)) return alert("اسم المستخدم موجود مسبقًا");

    const { error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password: newUserPassword,
          role: newUserRole,
          active: true,
        },
      ]);

    if (error) {
      console.error(error);
      return alert(error.code === "23505" ? "اسم المستخدم موجود مسبقًا" : "خطأ في إضافة المستخدم");
    }

    await refreshUsers();
    addAuditLog?.("إضافة مستخدم", `تم إضافة المستخدم ${username} بصلاحية ${roleLabel(newUserRole)}`);

    setNewUsername("");
    setNewUserPassword("");
    setNewUserRole("cashier");
    alert("تم إضافة المستخدم");
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    setEditPassword("");
    setEditRole(user.role);
  };

  const saveEditUser = async () => {
    if (!isAdmin) return alert("هذه الصلاحية للمدير فقط");
    const username = editUsername.trim();
    if (!username) return alert("أدخل اسم المستخدم");
    if (users.some((u) => u.id !== editingUserId && u.username === username)) return alert("اسم المستخدم موجود مسبقًا");
    if (editPassword && editPassword.length < 4) return alert("كلمة المرور يجب أن تكون 4 خانات على الأقل");

    const oldUser = users.find((u) => u.id === editingUserId);
    if (oldUser?.role === "admin" && editRole !== "admin" && activeAdmins.length <= 1) {
      return alert("لا يمكن تغيير صلاحية آخر مدير");
    }

    const payload = {
      username,
      role: editRole,
      ...(editPassword ? { password: editPassword } : {}),
    };

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", editingUserId);

    if (error) {
      console.error(error);
      return alert(error.code === "23505" ? "اسم المستخدم موجود مسبقًا" : "خطأ في تعديل المستخدم");
    }

    await refreshUsers();
    addAuditLog?.("تعديل مستخدم", `تم تعديل المستخدم ${username} إلى صلاحية ${roleLabel(editRole)}${editPassword ? " مع تغيير كلمة المرور" : ""}`);

    setEditingUserId(null);
    setEditUsername("");
    setEditPassword("");
    setEditRole("cashier");
    alert("تم تعديل المستخدم");
  };

  const toggleUserActive = async (id) => {
    if (!isAdmin) return;
    if (id === currentUser.id) return alert("لا يمكنك تعطيل حسابك الحالي");

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    if (targetUser.role === "admin" && targetUser.active !== false && activeAdmins.length <= 1) {
      return alert("لا يمكن تعطيل آخر مدير");
    }

    const nextActive = targetUser.active === false ? true : false;

    const { error } = await supabase
      .from("users")
      .update({ active: nextActive })
      .eq("id", id);

    if (error) {
      console.error(error);
      return alert("خطأ في تغيير حالة المستخدم");
    }

    await refreshUsers();
    addAuditLog?.(nextActive ? "تفعيل مستخدم" : "تعطيل مستخدم", `تم ${nextActive ? "تفعيل" : "تعطيل"} المستخدم ${targetUser.username}`);
  };

  const deleteUser = async (id) => {
    if (!isAdmin) return;
    if (id === currentUser.id) return alert("لا يمكنك حذف حسابك الحالي");

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    if (targetUser.role === "admin" && activeAdmins.length <= 1) {
      return alert("لا يمكن حذف آخر مدير");
    }

    if (!window.confirm("هل أنت متأكد من حذف المستخدم؟")) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return alert("خطأ في حذف المستخدم");
    }

    await refreshUsers();
    addAuditLog?.("حذف مستخدم", `تم حذف المستخدم ${targetUser.username}`);
  };

  const saveStoreSettings = () => {
    const nextSettings = {
      storeName: storeName.trim() || "حساباتي",
      phone: storePhone.trim(),
      address: storeAddress.trim(),
      logo: storeLogo || "/logo-hisabati.png",
    };

    setStoreSettings?.(nextSettings);
    addAuditLog?.("تعديل بيانات المتجر", `تم تعديل بيانات المتجر: ${nextSettings.storeName}`);
    alert("تم حفظ بيانات المتجر");
  };

  const handleLogoUpload = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return alert("اختر ملف صورة فقط");
    }

    if (file.size > 700 * 1024) {
      return alert("حجم الشعار كبير. يفضل أقل من 700KB");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setStoreLogo(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <h1>الإعدادات</h1>

      <div style={styles.card}>
        <h3>النسخ الاحتياطي الكامل</h3>
        <p style={{ color: "#64748b" }}>
          تصدير بيانات Supabase الفعلية + إعدادات النظام. يتم إخفاء كلمات مرور المستخدمين في النسخة الاحتياطية.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button style={styles.saveBtn} onClick={exportBackup}>تصدير JSON</button>
          <button style={styles.printBtn} onClick={exportBackupExcel}>تصدير Excel</button>
        </div>
      </div>

      <div style={styles.card}>
        <h3>تغيير كلمة المرور</h3>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="كلمة المرور الحالية" style={styles.input} />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" style={styles.input} />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور الجديدة" style={styles.input} />
        <button style={styles.saveBtn} onClick={changePassword}>حفظ كلمة المرور</button>
      </div>

      {isAdmin && (
        <div style={styles.card}>
          <h3>إدارة المستخدمين الكاملة</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "10px" }}>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="اسم مستخدم جديد" style={styles.input} />
            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="كلمة المرور" style={styles.input} />
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={styles.input}>
              <option value="cashier">Cashier - كاشير</option>
              <option value="accountant">Accountant - محاسب</option>
              <option value="admin">Admin - مدير</option>
            </select>
          </div>
          <button style={styles.saveBtn} onClick={addUser}>إضافة مستخدم</button>

          {editingUserId && (
            <div style={{ ...styles.formCard, marginTop: "20px" }}>
              <h3>تعديل مستخدم</h3>
              <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="اسم المستخدم" style={styles.input} />
              <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="كلمة مرور جديدة - اتركها فارغة بدون تغيير" style={styles.input} />
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={styles.input}>
                <option value="cashier">Cashier - كاشير</option>
                <option value="accountant">Accountant - محاسب</option>
                <option value="admin">Admin - مدير</option>
              </select>
              <button style={styles.saveBtn} onClick={saveEditUser}>حفظ التعديل</button>
              <button style={{ ...styles.deleteBtn, marginRight: "10px" }} onClick={() => setEditingUserId(null)}>إلغاء</button>
            </div>
          )}

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>اسم المستخدم</th>
                <th style={styles.th}>الصلاحية</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>تعديل</th>
                <th style={styles.th}>تعطيل / تفعيل</th>
                <th style={styles.th}>حذف</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.username}</td>
                  <td style={styles.td}>{roleLabel(u.role)}</td>
                  <td style={styles.td}>{u.active === false ? "معطل" : "فعال"}</td>
                  <td style={styles.td}><button style={styles.editBtn || styles.saveBtn} onClick={() => startEditUser(u)}>تعديل</button></td>
                  <td style={styles.td}><button style={styles.printBtn} onClick={() => toggleUserActive(u.id)}>{u.active === false ? "تفعيل" : "تعطيل"}</button></td>
                  <td style={styles.td}><button style={styles.deleteBtn} onClick={() => deleteUser(u.id)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <div style={styles.card}>
          <h3>سجل العمليات</h3>
          <p style={{ color: "#64748b" }}>
            آخر العمليات التي تمت داخل النظام مع اسم المستخدم والتاريخ.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
            <button style={styles.deleteBtn} onClick={clearAuditLogs}>مسح السجل</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>التاريخ</th>
                <th style={styles.th}>المستخدم</th>
                <th style={styles.th}>الصلاحية</th>
                <th style={styles.th}>العملية</th>
                <th style={styles.th}>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan="5">لا يوجد عمليات مسجلة</td>
                </tr>
              ) : (
                auditLogs.slice(0, 200).map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>{log.date}</td>
                    <td style={styles.td}>{log.user}</td>
                    <td style={styles.td}>{roleLabel(log.role)}</td>
                    <td style={styles.td}>{log.action}</td>
                    <td style={styles.td}>{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </>
  );
}

export default Settings;
