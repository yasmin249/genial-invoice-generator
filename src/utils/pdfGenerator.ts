
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { InvoiceItem, SellerDetails, BuyerDetails, TaxCalculation } from '@/types/invoice';
import { calculateTotal } from './invoiceCalculations';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoicePDF = (
  invoiceNumber: string,
  invoiceDate: string,
  sellerDetails: SellerDetails,
  buyerDetails: BuyerDetails,
  items: InvoiceItem[],
  tax: TaxCalculation
) => {
  const doc = new jsPDF();
  const subtotal = calculateTotal(items);
  const grandTotal = subtotal + tax.total;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(41, 98, 255);
  doc.text('TAX INVOICE', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(41, 98, 255);
  doc.text(sellerDetails.name, 20, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(sellerDetails.address, 20, 42);
  doc.text(`GSTIN: ${sellerDetails.gstin}`, 20, 48);

  // Invoice details box
  doc.rect(140, 25, 65, 35);
  doc.text(`Invoice No.: ${invoiceNumber}`, 142, 32);
  doc.text(`State: ${sellerDetails.state}`, 142, 38);
  doc.text(`Code: ${sellerDetails.stateCode}`, 142, 44);
  doc.text(`Date: ${invoiceDate}`, 142, 50);
  doc.text('Vehicle No.: ', 142, 56);

  // GST details box
  doc.rect(140, 65, 65, 20);
  doc.text(`GST No.: ${buyerDetails.gstin}`, 142, 72);
  doc.text(`STATE: ${buyerDetails.state.toUpperCase()}`, 142, 78);
  doc.text(`CODE: ${buyerDetails.stateCode}`, 142, 84);

  // Buyer details
  doc.text('Details of Receiver Billed to:', 20, 70);
  doc.text(`Name: ${buyerDetails.name}`, 20, 77);
  doc.text(`Address: ${buyerDetails.address}`, 20, 84);
  doc.text(`GSTIN: ${buyerDetails.gstin}`, 20, 91);
  doc.text(`STATE: ${buyerDetails.state.toUpperCase()}    STATE CODE: ${buyerDetails.stateCode}`, 20, 98);

  // Table
  const tableData = items.map((item, index) => [
    index + 1,
    item.particulars,
    item.hsn,
    item.quantity,
    item.rate,
    item.amount.toFixed(2)
  ]);

  doc.autoTable({
    startY: 110,
    head: [['Sr. no.', 'Particulars', 'HSN', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240] }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Tax calculations
  doc.text(`Total GST Amount: ${subtotal.toFixed(2)}`, 20, finalY + 10);
  doc.text(`Invoice Value Rs.: ${subtotal.toFixed(2)}`, 20, finalY + 17);

  if (tax.cgst > 0) {
    doc.text(`CGST 9%: ${tax.cgst.toFixed(2)}`, 140, finalY + 10);
    doc.text(`SGST 9%: ${tax.sgst.toFixed(2)}`, 140, finalY + 17);
  } else {
    doc.text(`IGST 18%: ${tax.igst.toFixed(2)}`, 140, finalY + 10);
  }

  doc.text(`Round Off: 0.00`, 140, finalY + 24);
  doc.text(`TOTAL: ${grandTotal.toFixed(2)}`, 140, finalY + 31);

  // Footer notes
  doc.text('N.B.: Goods once sold will not be taken back.', 20, finalY + 40);
  doc.text('Received the above-mentioned goods in good order &', 20, finalY + 47);
  doc.text('condition.', 20, finalY + 54);

  doc.text(`For, ${sellerDetails.name}`, 140, finalY + 60);
  doc.text("Receiver's Signature", 20, finalY + 70);

  return doc;
};
