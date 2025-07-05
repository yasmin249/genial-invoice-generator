
import { InvoiceItem, SellerDetails, BuyerDetails, TaxCalculation } from '@/types/invoice';
import { calculateTotal } from './invoiceCalculations';

export const saveInvoiceToGoogleSheets = async (
  invoiceNumber: string,
  invoiceDate: string,
  sellerDetails: SellerDetails,
  buyerDetails: BuyerDetails,
  items: InvoiceItem[],
  tax: TaxCalculation,
  googleSheetsUrl: string,
  driveApiKey: string
): Promise<boolean> => {
  // Extract spreadsheet ID from URL
  const urlMatch = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!urlMatch) {
    throw new Error('Invalid Google Sheets URL format');
  }
  
  const spreadsheetId = urlMatch[1];
  const total = calculateTotal(items) + tax.total;
  
  // Prepare data for Google Sheets
  const rowData = [
    invoiceNumber,
    invoiceDate,
    buyerDetails.name,
    buyerDetails.address,
    buyerDetails.gstin,
    buyerDetails.state,
    buyerDetails.stateCode,
    JSON.stringify(items), // Store items as JSON string
    calculateTotal(items).toFixed(2),
    tax.cgst.toFixed(2),
    tax.sgst.toFixed(2),
    tax.igst.toFixed(2),
    total.toFixed(2)
  ];

  // Google Sheets API call
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=RAW&key=${driveApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Google Sheets API error: ${errorData}`);
  }

  return true;
};
