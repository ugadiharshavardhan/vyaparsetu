export function downloadInvoiceHtml(html: string, invoiceNumber: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `VyaparSetu-${invoiceNumber.replace(/[^\w-]+/g, "-")}.html`;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  // Revoking the blob URL synchronously can abort the download in Chromium —
  // defer cleanup until the browser has had time to start saving the file.
  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 2_000);
}
