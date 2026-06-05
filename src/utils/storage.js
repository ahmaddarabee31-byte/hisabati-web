export const safeParseArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const saveArray = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const sanitizeText = (value) =>
  String(value || "").replace(/[<>]/g, "").trim();

export const getNextInvoiceNumber = (invoices) =>
  invoices.length
    ? Math.max(...invoices.map((i) => Number(i.invoiceNumber || 0))) + 1
    : 1;