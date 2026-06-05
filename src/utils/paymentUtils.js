export const applyPaymentToInvoices = (
  invoices,
  matchInvoice,
  amount,
  paidField = "paidAmount"
) => {
  let amountLeft = Number(amount || 0);

  return invoices.map((invoice) => {
    if (
      !matchInvoice(invoice) ||
      amountLeft <= 0 ||
      Number(invoice.remaining || 0) <= 0
    ) {
      return invoice;
    }

    const invoiceRemaining = Number(invoice.remaining || 0);
    const paidNow = Math.min(amountLeft, invoiceRemaining);
    amountLeft -= paidNow;

    const newRemaining = invoiceRemaining - paidNow;

    return {
      ...invoice,
      [paidField]: Number(invoice[paidField] || 0) + paidNow,
      remaining: newRemaining,
      status: newRemaining <= 0 ? "مدفوعة" : "مدفوعة جزئياً",
    };
  });
};