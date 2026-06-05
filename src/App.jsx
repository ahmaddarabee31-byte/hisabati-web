import { useState, useEffect } from "react";
import "./App.css";
import POS from "./components/POS";
import Products from "./components/Products";
import Suppliers from "./components/Suppliers";
import Reports from "./components/Reports";
import PurchaseInvoices from "./components/PurchaseInvoices";
import SalesInvoices from "./components/SalesInvoices";
import Customers from "./components/Customers";
import CustomerLiabilities from "./components/CustomerLiabilities";
import Liabilities from "./components/Liabilities";
import Debts from "./components/Debts";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Sidebar from "./components/Sidebar";
import CustomerStatement from "./components/CustomerStatement";
import SupplierStatement from "./components/SupplierStatement";
import {
  safeParseArray,
  saveArray,
  sanitizeText,
  getNextInvoiceNumber,
} from "./utils/storage";

import { applyPaymentToInvoices } from "./utils/paymentUtils";
import { styles } from "./styles/styles";
import { supabase } from "./supabaseClient";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("currentPage") || "dashboard"
  );

  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const normalizeUser = (user) => ({
    id: user.id,
    username: user.username,
    password: user.password,
    role: user.role || "cashier",
    active: user.active !== false,
    createdAt: user.created_at || user.createdAt || null,
  });

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل المستخدمين من Supabase. تأكد من إنشاء جدول users");
      setUsers([]);
      setUsersLoaded(true);
      return;
    }

    setUsers((data || []).map(normalizeUser));
    setUsersLoaded(true);
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hisabatiCurrentUser")) || null;
    } catch {
      return null;
    }
  });

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");


  const defaultStoreSettings = {
    storeName: "حساباتي",
    phone: "",
    address: "",
    logo: "/logo-hisabati.png",
  };

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      return {
        ...defaultStoreSettings,
        ...(JSON.parse(localStorage.getItem("hisabatiStoreSettings")) || {}),
      };
    } catch {
      return defaultStoreSettings;
    }
  });

  const pagePermissions = {
    admin: [
      "dashboard",
      "pos",
      "products",
      "customers",
      "suppliers",
      "salesInvoices",
      "purchaseInvoices",
      "reports",
      "customerLiabilities",
      "liabilities",
      "debts",
      "customerStatement",
      "supplierStatement",
      "settings",
    ],
    cashier: ["dashboard", "pos", "salesInvoices", "customers"],
    accountant: [
      "dashboard",
      "customers",
      "suppliers",
      "salesInvoices",
      "purchaseInvoices",
      "reports",
      "customerLiabilities",
      "liabilities",
      "debts",
      "customerStatement",
      "supplierStatement",
    ],
  };

  const canAccess = (targetPage) => {
    if (!currentUser) return false;
    return (pagePermissions[currentUser.role] || []).includes(targetPage);
  };

  const goToPage = (targetPage) => {
    if (!canAccess(targetPage)) {
      alert("لا تملك صلاحية الوصول لهذه الصفحة");
      return;
    }
    setPage(targetPage);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const usernameInput = loginUsername.trim();
    const passwordInput = loginPassword;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", usernameInput)
      .eq("password", passwordInput)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error(error);
      return alert("حدث خطأ أثناء تسجيل الدخول");
    }

    if (!data) return alert("اسم المستخدم أو كلمة المرور غير صحيحة");

    const safeUser = {
      id: data.id,
      username: data.username,
      role: data.role || "cashier",
      active: data.active !== false,
    };

    setCurrentUser(safeUser);
    localStorage.setItem("hisabatiCurrentUser", JSON.stringify(safeUser));
    setLoginUsername("");
    setLoginPassword("");
    setPage("dashboard");

    await loadUsers();

    const loginLog = {
      id: Date.now() + Math.random(),
      user: safeUser.username,
      role: safeUser.role,
      action: "تسجيل دخول",
      details: `دخل المستخدم ${safeUser.username} إلى النظام`,
      date: new Date().toLocaleString("ar-PS"),
      isoDate: new Date().toISOString(),
    };
    const oldLogs = JSON.parse(localStorage.getItem("hisabatiAuditLogs") || "[]");
    localStorage.setItem("hisabatiAuditLogs", JSON.stringify([loginLog, ...oldLogs].slice(0, 1000)));
    setAuditLogs((prev) => [loginLog, ...prev].slice(0, 1000));
  };

  const logout = () => {
    addAuditLog("تسجيل خروج", `خرج المستخدم ${currentUser?.username || ""} من النظام`);
    setCurrentUser(null);
    localStorage.removeItem("hisabatiCurrentUser");
    setPage("dashboard");
  };
  const [customers, setCustomers] = useState([]);
  const [paymentNote, setPaymentNote] = useState("");
  const [barcodeType, setBarcodeType] = useState("single");
  const [brand, setBrand] = useState("");
  const [selectedStatementInvoice, setSelectedStatementInvoice] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedSupplierInvoice, setSelectedSupplierInvoice] = useState(null);
  const [selectedSupplierStatement, setSelectedSupplierStatement] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedCustomerStatement, setSelectedCustomerStatement] = useState(null);
  const [purchaseInvoiceSearch, setPurchaseInvoiceSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [supplierPaymentAmount, setSupplierPaymentAmount] = useState("");
  const [supplierPaymentDate, setSupplierPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedDebtCustomer, setSelectedDebtCustomer] = useState(null);
  const [selectedCustomerInvoice, setSelectedCustomerInvoice] = useState(null);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const [selectedCustomerDebt, setSelectedCustomerDebt] = useState(null);

  const [paymentCustomerId, setPaymentCustomerId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const [purchaseSupplierId, setPurchaseSupplierId] = useState("");
  const [purchaseProductId, setPurchaseProductId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchaseInvoicePrice, setPurchaseInvoicePrice] = useState("");
  const [purchasePaid, setPurchasePaid] = useState("");
  const [purchaseInvoiceStatus, setPurchaseInvoiceStatus] = useState("مسودة");
  const [selectedPurchaseInvoice, setSelectedPurchaseInvoice] = useState(null);

  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [barcodes, setBarcodes] = useState(["", ""]);
  const [categories, setCategories] = useState([
    "شواحن",
    "كابلات",
    "سماعات",
    "كفرات",
    "لزقات حماية",
    "ساعات ذكية",
  ]);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [singleBarcode, setSingleBarcode] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hisabatiAuditLogs")) || [];
    } catch {
      return [];
    }
  });

  const addAuditLog = (action, details = "") => {
    const log = {
      id: Date.now() + Math.random(),
      user: currentUser?.username || "system",
      role: currentUser?.role || "system",
      action,
      details,
      date: new Date().toLocaleString("ar-PS"),
      isoDate: new Date().toISOString(),
    };

    setAuditLogs((prev) => {
      const updated = [log, ...prev].slice(0, 1000);
      localStorage.setItem("hisabatiAuditLogs", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAuditLogs = () => {
    if (!window.confirm("هل أنت متأكد من حذف سجل العمليات؟")) return;
    setAuditLogs([]);
    localStorage.removeItem("hisabatiAuditLogs");
  };

  const lowStockProducts = products.filter((p) => Number(p.quantity || 0) <= 5);

  const isApprovedInvoice = (invoice) =>
    (invoice.invoiceStatus || invoice.invoice_status || "معتمدة") === "معتمدة";

  const approvedSalesInvoices = salesInvoices.filter(isApprovedInvoice);
  const approvedPurchaseInvoices = purchaseInvoices.filter(isApprovedInvoice);

const updateCustomer = async (customer) => {
    const { error } = await supabase
      .from("customers")
      .update({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      })
      .eq("id", customer.id);

    if (error) {
      console.error(error);
      return alert("خطأ في تعديل الزبون");
    }

    await loadCustomers();
    addAuditLog("تعديل زبون", `تم تعديل بيانات الزبون: ${customer.name}`);
    setEditingCustomer(null);
  };
  const saveCustomer = async () => {
    if (!customerName.trim()) return alert("أدخل اسم الزبون");

    const customerData = {
      name: sanitizeText(customerName),
      phone: sanitizeText(customerPhone),
      address: sanitizeText(customerAddress),
    };

    const { error } = await supabase
      .from("customers")
      .insert([customerData]);

    if (error) {
      console.error(error);
      return alert("خطأ في حفظ الزبون");
    }

    await loadCustomers();
    addAuditLog("إضافة زبون", `تم إضافة الزبون: ${customerData.name}`);

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  const deleteProduct = async (product) => {
    const usedInSales = salesInvoices.some((invoice) =>
      invoice.items?.some((item) => item.id === product.id)
    );

    const usedInPurchases = purchaseInvoices.some(
      (invoice) => invoice.productName === product.name
    );

    if (usedInSales || usedInPurchases) {
      return alert("لا يمكن حذف المنتج لأنه مرتبط بفواتير سابقة");
    }

    if (!window.confirm("هل أنت متأكد من حذف المنتج؟")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);
      return alert("خطأ في حذف المنتج");
    }

    await loadProducts();
    addAuditLog("حذف منتج", `تم حذف المنتج: ${product.name}`);
  };

  const totalCustomerDebt = customers.reduce((sum, customer) => {
    const invoices = approvedSalesInvoices.filter(
      (i) => i.customerName === customer.name
    );

    const debt = invoices.reduce(
      (s, i) => s + Number(i.remaining || 0),
      0
    );

    return sum + debt;
  }, 0);

  const totalSupplierDebt = approvedPurchaseInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.remaining || 0),
    0
  );

  useEffect(() => {
    localStorage.setItem("currentPage", page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("hisabatiStoreSettings", JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (currentUser && !canAccess(page)) {
      setPage("dashboard");
    }
  }, [currentUser, page]);
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل المنتجات من Supabase");
      return;
    }

    setProducts(
      (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        description: p.description,
        barcodes: p.barcodes || [],
        salePrice: Number(p.sale_price || 0),
        purchasePrice: Number(p.purchase_price || 0),
        quantity: Number(p.quantity || 0),
      }))
    );
  };

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل العملاء");
      return;
    }

    setCustomers(data || []);
  };

  const loadSuppliers = async () => {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل الموردين");
      return;
    }

    setSuppliers(data || []);
  };

  const loadSalesInvoices = async () => {
    const { data, error } = await supabase
      .from("sales_invoices")
      .select("*, sales_invoice_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل فواتير البيع");
      return;
    }

    setSalesInvoices(
      (data || []).map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        total: Number(invoice.total || 0),
        discount: Number(invoice.discount || 0),
        grandTotal: Number(invoice.grand_total || 0),
        capital: Number(invoice.capital || 0),
        profit: Number(invoice.profit || 0),
        paidAmount: Number(invoice.paid_amount || 0),
        remaining: Number(invoice.remaining || 0),
        status: invoice.status,
        invoiceStatus: invoice.invoice_status || "معتمدة",
        invoice_status: invoice.invoice_status || "معتمدة",
        items: (invoice.sales_invoice_items || []).map((item) => ({
          id: item.product_id || item.id,
          name: item.product_name,
          barcode: item.barcode,
          qty: Number(item.quantity || 0),
          price: Number(item.sale_price || 0),
          cost: Number(item.purchase_price || 0),
          total: Number(item.total || 0),
        })),
      }))
    );
  };

  const loadPurchaseInvoices = async () => {
    const { data, error } = await supabase
      .from("purchase_invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل فواتير الشراء");
      return;
    }

    setPurchaseInvoices(
      (data || []).map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        supplierId: invoice.supplier_id,
        supplierName: invoice.supplier_name,
        productId: invoice.product_id,
        productName: invoice.product_name,
        qty: Number(invoice.qty || 0),
        price: Number(invoice.price || 0),
        total: Number(invoice.total || 0),
        paid: Number(invoice.paid || 0),
        remaining: Number(invoice.remaining || 0),
        date: invoice.date,
        status: invoice.status,
        invoiceStatus: invoice.invoice_status || "معتمدة",
        invoice_status: invoice.invoice_status || "معتمدة",
      }))
    );
  };

  const loadCustomerPayments = async () => {
    const { data, error } = await supabase
      .from("customer_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل دفعات الزبائن");
      return;
    }

    setCustomerPayments(data || []);
  };

  const loadSupplierPayments = async () => {
    const { data, error } = await supabase
      .from("supplier_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("خطأ في تحميل دفعات الموردين");
      return;
    }

    setSupplierPayments(data || []);
  };

  const reloadAccountingData = async () => {
    await Promise.all([
      loadProducts(),
      loadSalesInvoices(),
      loadPurchaseInvoices(),
      loadCustomerPayments(),
      loadSupplierPayments(),
    ]);
  };

  useEffect(() => {
    loadUsers();
    loadProducts();
    loadCustomers();
    loadSuppliers();
    loadSalesInvoices();
    loadPurchaseInvoices();
    loadCustomerPayments();
    loadSupplierPayments();
  }, []);
  const saveProduct = async () => {
    const finalCategory = category === "other" ? newCategory.trim() : category;

    const finalBarcodes =
      barcodeType === "single"
        ? [singleBarcode.trim()].filter(Boolean)
        : barcodes.map((b) => b.trim()).filter(Boolean);

    if (!productName.trim()) return alert("أدخل اسم المنتج");
    if (!finalCategory) return alert("اختر التصنيف");
    if (finalBarcodes.length === 0) return alert("أدخل باركود واحد على الأقل");

    const barcodeExists = products.some(
      (p) =>
        p.id !== editingId &&
        (p.barcodes || []).some((b) => finalBarcodes.includes(b))
    );

    if (barcodeExists) return alert("يوجد باركود مكرر لمنتج آخر");

    if (category === "other" && newCategory.trim()) {
      setCategories([...categories, sanitizeText(newCategory)]);
      setCategory(sanitizeText(newCategory));
      setNewCategory("");
    }

    const productData = {
      name: sanitizeText(productName),
      category: sanitizeText(finalCategory),
      brand: sanitizeText(brand),
      description: sanitizeText(description),
      barcodes: finalBarcodes,
      sale_price: Number(salePrice || 0),
      purchase_price: Number(purchasePrice || 0),
      quantity: Number(quantity || 0),
    };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        return alert("خطأ في تعديل المنتج");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select();

      console.log("saved product:", data);
      console.log("save error:", error);
      if (error) {
        console.error(error);
        return alert("خطأ في حفظ المنتج");
      }
    }

    await loadProducts();
    addAuditLog(editingId ? "تعديل منتج" : "إضافة منتج", `${editingId ? "تم تعديل" : "تم إضافة"} المنتج: ${productData.name}`);

    setEditingId(null);
    setProductName("");
    setSingleBarcode("");
    setBarcodes(["", ""]);
    setBrand("");
    setDescription("");
    setSalePrice("");
    setPurchasePrice("");
    setQuantity("");
  };



  const addBarcode = () => {
    setBarcodes([...barcodes, ""]);
  };

  const updateBarcode = (index, value) => {
    const newBarcodes = [...barcodes];
    newBarcodes[index] = value;
    setBarcodes(newBarcodes);
  };

  const removeBarcode = (index) => {
    setBarcodes(barcodes.filter((_, i) => i !== index));
  };



  const editProduct = (p) => {
    setEditingId(p.id);
    setProductName(p.name);
    setCategory(p.category);
    setBrand(p.brand || "");
    setDescription(p.description || "");
    setSalePrice(p.salePrice);
    setPurchasePrice(p.purchasePrice);
    setQuantity(p.quantity);

    if ((p.barcodes || []).length > 1) {
      setBarcodeType("multiple");
      setBarcodes(p.barcodes);
    } else {
      setBarcodeType("single");
      setSingleBarcode((p.barcodes || [""])[0]);
    }

  };

  
  const saveSupplier = async () => {
    if (!supplierName.trim()) return alert("أدخل اسم المورد");

    const supplierData = {
      name: sanitizeText(supplierName),
      phone: sanitizeText(supplierPhone),
      address: sanitizeText(supplierAddress),
    };

    const { error } = await supabase
      .from("suppliers")
      .insert([supplierData]);

    if (error) {
      console.error(error);
      return alert("خطأ في حفظ المورد");
    }

    await loadSuppliers();
    addAuditLog("إضافة مورد", `تم إضافة المورد: ${supplierData.name}`);

    setSupplierName("");
    setSupplierPhone("");
    setSupplierAddress("");
  };

  const updateSupplier = async (supplier) => {
    const { error } = await supabase
      .from("suppliers")
      .update({
        name: supplier.name,
        phone: supplier.phone,
        address: supplier.address,
      })
      .eq("id", supplier.id);

    if (error) {
      console.error(error);
      return alert("خطأ في تعديل المورد");
    }

    await loadSuppliers();
    addAuditLog("تعديل مورد", `تم تعديل بيانات المورد: ${supplier.name}`);
    setEditingSupplier(null);
  };

  const savePurchaseInvoice = async () => {
    const supplier = suppliers.find((s) => s.id === purchaseSupplierId);
    if (!supplier) return alert("اختر المورد");

    const product = products.find((p) => p.id === purchaseProductId);
    if (!product) return alert("اختر المنتج");

    const qty = Number(purchaseQty || 0);
    const price = Number(purchaseInvoicePrice || 0);
    const paid = Number(purchasePaid || 0);
    const total = qty * price;
    const remaining = total - paid;

    if (qty <= 0) return alert("أدخل كمية صحيحة");
    if (price <= 0) return alert("أدخل سعر شراء صحيح");
    if (paid < 0 || paid > total) return alert("المبلغ المدفوع غير صحيح");

    const nextPurchaseInvoiceNumber =
      purchaseInvoices.length > 0
        ? Math.max(...purchaseInvoices.map((i) => Number(i.invoiceNumber || 0))) + 1
        : 1;

    const invoiceStatus = purchaseInvoiceStatus || "مسودة";

    const { error: invoiceError } = await supabase
      .from("purchase_invoices")
      .insert([
        {
          invoice_number: nextPurchaseInvoiceNumber,
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          product_id: product.id,
          product_name: product.name,
          qty,
          price,
          total,
          paid,
          remaining,
          date: purchaseDate,
          status: remaining <= 0 ? "مدفوعة" : "دين",
          invoice_status: invoiceStatus,
        },
      ]);

    if (invoiceError) {
      console.error(invoiceError);
      return alert("خطأ في حفظ فاتورة الشراء");
    }

    if (invoiceStatus === "معتمدة") {
      const newQuantity = Number(product.quantity || 0) + qty;

      const { error: productError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", product.id);

      if (productError) {
        console.error(productError);
        return alert("تم حفظ الفاتورة لكن حدث خطأ في تحديث المخزون");
      }
    }

    await reloadAccountingData();

    setPurchaseSupplierId("");
    setPurchaseProductId("");
    setPurchaseQty("");
    setPurchaseInvoicePrice("");
    setPurchasePaid("");
    setPurchaseInvoiceStatus("مسودة");

    addAuditLog(
      invoiceStatus === "مسودة" ? "إنشاء فاتورة شراء مسودة" : "إنشاء واعتماد فاتورة شراء",
      `فاتورة شراء رقم ${nextPurchaseInvoiceNumber} - المورد: ${supplier.name} - المنتج: ${product.name} - الإجمالي: ₪ ${total}`
    );

    alert(invoiceStatus === "مسودة" ? "تم حفظ فاتورة الشراء كمسودة" : "تم حفظ واعتماد فاتورة الشراء");
  };

  const applyCustomerPaymentToSupabaseInvoices = async (customerId, amount) => {
    let remainingAmount = Number(amount);

    const customerInvoices = approvedSalesInvoices
      .filter((invoice) => invoice.customerId === customerId && Number(invoice.remaining || 0) > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const invoice of customerInvoices) {
      if (remainingAmount <= 0) break;

      const invoiceRemaining = Number(invoice.remaining || 0);
      const paymentApplied = Math.min(remainingAmount, invoiceRemaining);
      remainingAmount -= paymentApplied;

      const { error } = await supabase
        .from("sales_invoices")
        .update({
          paid_amount: Number(invoice.paidAmount || 0) + paymentApplied,
          remaining: invoiceRemaining - paymentApplied,
          status: invoiceRemaining - paymentApplied <= 0 ? "مدفوعة" : "دين",
        })
        .eq("id", invoice.id);

      if (error) throw error;
    }
  };

  const saveCustomerPayment = async () => {
    const customer = customers.find((c) => c.id === paymentCustomerId);
    if (!customer) return alert("اختر الزبون");
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      return alert("أدخل مبلغ صحيح");
    }

    const { error } = await supabase
      .from("customer_payments")
      .insert([
        {
          customer_id: customer.id,
          customer_name: customer.name,
          amount: Number(paymentAmount),
          date: new Date().toISOString().split("T")[0],
          notes: sanitizeText(paymentNote || ""),
        },
      ]);

    if (error) {
      console.error(error);
      return alert("خطأ في تسجيل سند القبض");
    }

    try {
      await applyCustomerPaymentToSupabaseInvoices(customer.id, Number(paymentAmount));
    } catch (updateError) {
      console.error(updateError);
      return alert("تم تسجيل الدفعة لكن حدث خطأ في تحديث الفواتير");
    }

    await reloadAccountingData();

    setPaymentAmount("");
    setPaymentNote("");
    addAuditLog("سند قبض من زبون", `تم تسجيل دفعة من الزبون ${customer.name} بقيمة ₪ ${paymentAmount}`);
    setPage("customerLiabilities");
    alert("تم تسجيل سند قبض");
  };

  const applySupplierPaymentToSupabaseInvoices = async (supplierId, amount) => {
    let remainingAmount = Number(amount);

    const supplierInvoices = approvedPurchaseInvoices
      .filter((invoice) => invoice.supplierId === supplierId && Number(invoice.remaining || 0) > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const invoice of supplierInvoices) {
      if (remainingAmount <= 0) break;

      const invoiceRemaining = Number(invoice.remaining || 0);
      const paymentApplied = Math.min(remainingAmount, invoiceRemaining);
      remainingAmount -= paymentApplied;

      const { error } = await supabase
        .from("purchase_invoices")
        .update({
          paid: Number(invoice.paid || 0) + paymentApplied,
          remaining: invoiceRemaining - paymentApplied,
          status: invoiceRemaining - paymentApplied <= 0 ? "مدفوعة" : "دين",
        })
        .eq("id", invoice.id);

      if (error) throw error;
    }
  };

  const saveSupplierPayment = async (supplier, amount, date, notes = "") => {
    if (!supplier) return alert("اختر المورد");
    if (!amount || Number(amount) <= 0) return alert("أدخل مبلغ صحيح");

    const { error } = await supabase
      .from("supplier_payments")
      .insert([
        {
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          amount: Number(amount),
          date,
          notes: sanitizeText(notes),
        },
      ]);

    if (error) {
      console.error(error);
      return alert("خطأ في تسجيل دفعة المورد");
    }

    try {
      await applySupplierPaymentToSupabaseInvoices(supplier.id, Number(amount));
    } catch (updateError) {
      console.error(updateError);
      return alert("تم تسجيل الدفعة لكن حدث خطأ في تحديث فواتير المورد");
    }

    await reloadAccountingData();

    setSupplierPaymentAmount("");
    addAuditLog("دفعة مورد", `تم تسجيل دفعة للمورد ${supplier.name} بقيمة ₪ ${amount}`);
    alert("تم تسجيل دفعة المورد");
  };

  const applySupplierPaymentToInvoices = (
    invoices,
    supplierId,
    amount
  ) => {
    let remainingAmount = Number(amount);

    return invoices.map((invoice) => {
      if (
        invoice.supplierId !== supplierId ||
        remainingAmount <= 0
      ) {
        return invoice;
      }

      const invoiceRemaining =
        Number(invoice.remaining || 0);

      const paymentApplied = Math.min(
        remainingAmount,
        invoiceRemaining
      );

      remainingAmount -= paymentApplied;

      return {
        ...invoice,
        paid:
          Number(invoice.paid || 0) +
          paymentApplied,
        remaining:
          invoiceRemaining -
          paymentApplied,
      };
    });
  };

  const getInvoiceStatus = (invoice) =>
    invoice?.invoiceStatus || invoice?.invoice_status || "معتمدة";

  const approveSalesInvoice = async (invoice) => {
    if (!invoice) return;
    if (getInvoiceStatus(invoice) !== "مسودة") {
      return alert("يمكن اعتماد الفواتير المسودة فقط");
    }

    for (const item of invoice.items || []) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;

      if (Number(product.quantity || 0) < Number(item.qty || 0)) {
        return alert(`الكمية غير كافية لاعتماد الفاتورة للمنتج: ${item.name}`);
      }

      const { error: stockError } = await supabase
        .from("products")
        .update({ quantity: Number(product.quantity || 0) - Number(item.qty || 0) })
        .eq("id", item.id);

      if (stockError) {
        console.error(stockError);
        return alert("حدث خطأ أثناء تحديث المخزون");
      }
    }

    const { error } = await supabase
      .from("sales_invoices")
      .update({ invoice_status: "معتمدة" })
      .eq("id", invoice.id);

    if (error) {
      console.error(error);
      return alert("خطأ في اعتماد فاتورة المبيعات");
    }

    await reloadAccountingData();
    addAuditLog("اعتماد فاتورة مبيعات", `تم اعتماد فاتورة مبيعات رقم ${invoice.invoiceNumber}`);
    setSelectedInvoice(null);
    alert("تم اعتماد فاتورة المبيعات");
  };

  const cancelSalesInvoice = async (invoice) => {
    if (!invoice) return;

    const invoiceStatus = getInvoiceStatus(invoice);
    if (invoiceStatus === "ملغاة") {
      return alert("الفاتورة ملغاة مسبقًا");
    }

    if (!window.confirm("هل أنت متأكد من إلغاء فاتورة المبيعات؟")) return;

    if (invoiceStatus === "معتمدة") {
      for (const item of invoice.items || []) {
        const product = products.find((p) => p.id === item.id);
        if (!product) continue;

        const { error: stockError } = await supabase
          .from("products")
          .update({ quantity: Number(product.quantity || 0) + Number(item.qty || 0) })
          .eq("id", item.id);

        if (stockError) {
          console.error(stockError);
          return alert("حدث خطأ أثناء إعادة الكمية للمخزون");
        }
      }
    }

    const { error } = await supabase
      .from("sales_invoices")
      .update({ invoice_status: "ملغاة", status: "ملغاة" })
      .eq("id", invoice.id);

    if (error) {
      console.error(error);
      return alert("خطأ في إلغاء فاتورة المبيعات");
    }

    await reloadAccountingData();
    addAuditLog("إلغاء فاتورة مبيعات", `تم إلغاء فاتورة مبيعات رقم ${invoice.invoiceNumber}`);
    setSelectedInvoice(null);
    alert("تم إلغاء فاتورة المبيعات");
  };

  const approvePurchaseInvoice = async (invoice) => {
    if (!invoice) return;
    if (getInvoiceStatus(invoice) !== "مسودة") {
      return alert("يمكن اعتماد الفواتير المسودة فقط");
    }

    const product = products.find((p) => p.id === invoice.productId);
    if (!product) return alert("المنتج المرتبط بالفاتورة غير موجود");

    const { error: stockError } = await supabase
      .from("products")
      .update({ quantity: Number(product.quantity || 0) + Number(invoice.qty || 0) })
      .eq("id", invoice.productId);

    if (stockError) {
      console.error(stockError);
      return alert("حدث خطأ أثناء تحديث المخزون");
    }

    const { error } = await supabase
      .from("purchase_invoices")
      .update({ invoice_status: "معتمدة" })
      .eq("id", invoice.id);

    if (error) {
      console.error(error);
      return alert("خطأ في اعتماد فاتورة الشراء");
    }

    await reloadAccountingData();
    addAuditLog("اعتماد فاتورة شراء", `تم اعتماد فاتورة شراء رقم ${invoice.invoiceNumber}`);
    setSelectedPurchaseInvoice(null);
    alert("تم اعتماد فاتورة الشراء");
  };

  const cancelPurchaseInvoice = async (invoice) => {
    if (!invoice) return;

    const invoiceStatus = getInvoiceStatus(invoice);
    if (invoiceStatus === "ملغاة") {
      return alert("الفاتورة ملغاة مسبقًا");
    }

    if (!window.confirm("هل أنت متأكد من إلغاء فاتورة الشراء؟")) return;

    if (invoiceStatus === "معتمدة") {
      const product = products.find((p) => p.id === invoice.productId);
      if (!product) return alert("المنتج المرتبط بالفاتورة غير موجود");

      if (Number(product.quantity || 0) < Number(invoice.qty || 0)) {
        return alert("لا يمكن إلغاء الفاتورة لأن كمية المخزون الحالية أقل من كمية الفاتورة");
      }

      const { error: stockError } = await supabase
        .from("products")
        .update({ quantity: Number(product.quantity || 0) - Number(invoice.qty || 0) })
        .eq("id", invoice.productId);

      if (stockError) {
        console.error(stockError);
        return alert("حدث خطأ أثناء تحديث المخزون");
      }
    }

    const { error } = await supabase
      .from("purchase_invoices")
      .update({ invoice_status: "ملغاة", status: "ملغاة" })
      .eq("id", invoice.id);

    if (error) {
      console.error(error);
      return alert("خطأ في إلغاء فاتورة الشراء");
    }

    await reloadAccountingData();
    addAuditLog("إلغاء فاتورة شراء", `تم إلغاء فاتورة شراء رقم ${invoice.invoiceNumber}`);
    setSelectedPurchaseInvoice(null);
    alert("تم إلغاء فاتورة الشراء");
  };

  const saveCustomerStatementPayment = async (customer, amount) => {
    if (!customer) return alert("اختر الزبون");
    if (!amount || Number(amount) <= 0) return alert("أدخل مبلغ صحيح");

    const { error } = await supabase
      .from("customer_payments")
      .insert([
        {
          customer_id: customer.id,
          customer_name: customer.name,
          amount: Number(amount),
          date: new Date().toISOString().split("T")[0],
          notes: "دفعة من كشف الحساب",
        },
      ]);

    if (error) {
      console.error(error);
      return alert("خطأ في تسجيل الدفعة");
    }

    try {
      await applyCustomerPaymentToSupabaseInvoices(customer.id, Number(amount));
    } catch (updateError) {
      console.error(updateError);
      return alert("تم تسجيل الدفعة لكن حدث خطأ في تحديث الفواتير");
    }

    await reloadAccountingData();
    setPaymentAmount("");
    alert("تم تسجيل الدفعة");
  };

  const saveSupplierStatementPayment = async (supplier, amount) => {
    await saveSupplierPayment(
      supplier,
      amount,
      new Date().toISOString().split("T")[0],
      "دفعة من كشف الحساب"
    );
  };

  if (!usersLoaded) {
    return (
      <div dir="rtl" style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h2>جاري تحميل المستخدمين...</h2>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div dir="rtl" style={styles.loginPage}>
        <form onSubmit={handleLogin} style={styles.loginCard}>
          <h1 style={{ marginTop: 0 }}>حساباتي</h1>
          <h3>تسجيل الدخول</h3>

          <input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="اسم المستخدم"
            style={styles.input}
            autoFocus
          />

          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="كلمة المرور"
            style={styles.input}
          />

          <button style={styles.saveBtn}>دخول</button>

          <p style={{ color: "#64748b", marginTop: 18 }}>
            المستخدم الافتراضي: admin / 1234
          </p>
        </form>
      </div>
    );
  }

  return (
    <div dir="rtl" style={styles.app}>
      <Sidebar setPage={goToPage} styles={styles} currentUser={currentUser} canAccess={canAccess} />

      <main style={styles.content}>
        <div style={styles.userBar}>
          <span>المستخدم: {currentUser.username} - {currentUser.role}</span>
          <button onClick={logout} style={styles.logoutBtn}>تسجيل خروج</button>
        </div>
        {page === "dashboard" && (
          <Dashboard
            products={products}
            customers={customers}
            suppliers={suppliers}
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            totalCustomerDebt={totalCustomerDebt}
            totalSupplierDebt={totalSupplierDebt}
            lowStockProducts={lowStockProducts}
            styles={styles}
          />
        )}

        {page === "salesInvoices" && (
          <SalesInvoices
            invoiceSearch={invoiceSearch}
            setInvoiceSearch={setInvoiceSearch}
            selectedInvoice={selectedInvoice}
            setSelectedInvoice={setSelectedInvoice}
            styles={styles}
            safeParseArray={safeParseArray}
            salesInvoices={salesInvoices}
            approveSalesInvoice={approveSalesInvoice}
            cancelSalesInvoice={cancelSalesInvoice}
            storeSettings={storeSettings}
          />
        )}
        {page === "customers" && (
          <Customers
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            saveCustomer={saveCustomer}
            updateCustomer={updateCustomer}
            customers={customers}
            setCustomers={setCustomers}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            selectedCustomerAccount={selectedCustomerAccount}
            setSelectedCustomerAccount={setSelectedCustomerAccount}
            sanitizeText={sanitizeText}
            safeParseArray={safeParseArray}
            styles={styles}
            editingCustomer={editingCustomer}
            setEditingCustomer={setEditingCustomer}
          />
        )}

        {page === "products" && (
          <Products
            productName={productName}
            setProductName={setProductName}
            barcodeType={barcodeType}
            setBarcodeType={setBarcodeType}
            singleBarcode={singleBarcode}
            setSingleBarcode={setSingleBarcode}
            barcodes={barcodes}
            updateBarcode={updateBarcode}
            removeBarcode={removeBarcode}
            addBarcode={addBarcode}
            category={category}
            setCategory={setCategory}
            categories={categories}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            brand={brand}
            setBrand={setBrand}
            description={description}
            setDescription={setDescription}
            salePrice={salePrice}
            setSalePrice={setSalePrice}
            purchasePrice={purchasePrice}
            setPurchasePrice={setPurchasePrice}
            quantity={quantity}
            setQuantity={setQuantity}
            saveProduct={saveProduct}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            products={products}
            editProduct={editProduct}
            deleteProduct={deleteProduct}
            styles={styles}
          />
        )}
        {page === "customerStatement" && (
          <CustomerStatement
            customers={customers}
            selectedCustomerStatement={selectedCustomerStatement}
            setSelectedCustomerStatement={setSelectedCustomerStatement}

            selectedStatementInvoice={selectedStatementInvoice}
            setSelectedStatementInvoice={setSelectedStatementInvoice}

            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            salesInvoices={salesInvoices}
            customerPayments={customerPayments}
            saveCustomerStatementPayment={saveCustomerStatementPayment}
            styles={styles}
          />
        )}
        {page === "supplierStatement" && (
          <SupplierStatement
            suppliers={suppliers}
            selectedSupplierStatement={selectedSupplierStatement}
            setSelectedSupplierStatement={setSelectedSupplierStatement}
            supplierPaymentAmount={supplierPaymentAmount}
            selectedSupplierInvoice={selectedSupplierInvoice}
            setSelectedSupplierInvoice={setSelectedSupplierInvoice}
            setSupplierPaymentAmount={setSupplierPaymentAmount}
            purchaseInvoices={purchaseInvoices}
            supplierPayments={supplierPayments}
            saveSupplierStatementPayment={saveSupplierStatementPayment}
            styles={styles}
          />
        )}
        {page === "purchaseInvoices" && (
          <PurchaseInvoices
            purchaseInvoiceSearch={purchaseInvoiceSearch}
            setPurchaseInvoiceSearch={setPurchaseInvoiceSearch}
            purchaseSupplierId={purchaseSupplierId}
            setPurchaseSupplierId={setPurchaseSupplierId}
            suppliers={suppliers}
            purchaseProductId={purchaseProductId}
            setPurchaseProductId={setPurchaseProductId}
            products={products}
            purchaseQty={purchaseQty}
            setPurchaseQty={setPurchaseQty}
            purchaseInvoicePrice={purchaseInvoicePrice}
            setPurchaseInvoicePrice={setPurchaseInvoicePrice}
            purchasePaid={purchasePaid}
            setPurchasePaid={setPurchasePaid}
            purchaseDate={purchaseDate}
            setPurchaseDate={setPurchaseDate}
            purchaseInvoiceStatus={purchaseInvoiceStatus}
            setPurchaseInvoiceStatus={setPurchaseInvoiceStatus}
            savePurchaseInvoice={savePurchaseInvoice}
            selectedPurchaseInvoice={selectedPurchaseInvoice}
            setSelectedPurchaseInvoice={setSelectedPurchaseInvoice}
            purchaseInvoices={purchaseInvoices}
            approvePurchaseInvoice={approvePurchaseInvoice}
            cancelPurchaseInvoice={cancelPurchaseInvoice}
            styles={styles}
          />
        )}

        {page === "reports" && (
          <Reports
            reportFromDate={reportFromDate}
            setReportFromDate={setReportFromDate}
            reportToDate={reportToDate}
            setReportToDate={setReportToDate}
            salesInvoices={salesInvoices}
            styles={styles}
          />
        )}

        {page === "suppliers" && (
          <Suppliers
            supplierName={supplierName}
            setSupplierName={setSupplierName}
            supplierPhone={supplierPhone}
            setSupplierPhone={setSupplierPhone}
            supplierAddress={supplierAddress}
            setSupplierAddress={setSupplierAddress}
            saveSupplier={saveSupplier}
            supplierSearch={supplierSearch}
            setSupplierSearch={setSupplierSearch}
            suppliers={suppliers}
            styles={styles}
            editingSupplier={editingSupplier}
            setEditingSupplier={setEditingSupplier}
            updateSupplier={updateSupplier}
          />
        )}
        {page === "settings" && (
          <Settings
            products={products}
            customers={customers}
            suppliers={suppliers}
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            customerPayments={customerPayments}
            supplierPayments={supplierPayments}
            users={users}
            setUsers={setUsers}
            loadUsers={loadUsers}
            currentUser={currentUser}
            supabase={supabase}
            auditLogs={auditLogs}
            addAuditLog={addAuditLog}
            clearAuditLogs={clearAuditLogs}
            storeSettings={storeSettings}
            setStoreSettings={setStoreSettings}
            safeParseArray={safeParseArray}
            styles={styles}
          />
        )}

        {page === "customerLiabilities" && (
          <CustomerLiabilities
            customers={customers}
            selectedCustomerDebt={selectedCustomerDebt}
            setSelectedCustomerDebt={setSelectedCustomerDebt}
            selectedCustomerInvoice={selectedCustomerInvoice}
            setSelectedCustomerInvoice={setSelectedCustomerInvoice}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            safeParseArray={safeParseArray}
            saveArray={saveArray}
            applyPaymentToInvoices={applyPaymentToInvoices}
            styles={styles}
          />
        )}

        {page === "liabilities" && (
          <Liabilities
            suppliers={suppliers}
            purchaseInvoices={purchaseInvoices}
            selectedSupplier={selectedSupplier}
            setSelectedSupplier={setSelectedSupplier}
            supplierPaymentAmount={supplierPaymentAmount}
            setSupplierPaymentAmount={setSupplierPaymentAmount}
            supplierPaymentDate={supplierPaymentDate}
            setSupplierPaymentDate={setSupplierPaymentDate}
            saveSupplierPayment={saveSupplierPayment}
            safeParseArray={safeParseArray}
            styles={styles}
          />
        )}

        {page === "debts" && (
          <Debts
            selectedDebtCustomer={selectedDebtCustomer}
            setSelectedDebtCustomer={setSelectedDebtCustomer}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            safeParseArray={safeParseArray}
            saveArray={saveArray}
            applyPaymentToInvoices={applyPaymentToInvoices}
            styles={styles}
          />
        )}

        {page === "pos" && (
          <POS
            products={products}
            customers={customers}
            salesInvoices={salesInvoices}
            supabase={supabase}
            reloadAccountingData={reloadAccountingData}
            storeSettings={storeSettings}
          />
        )}
      </main>
    </div>
  );
}


export default App;
