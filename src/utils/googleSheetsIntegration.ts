
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
  console.log('Spreadsheet ID:', spreadsheetId);
  const total = calculateTotal(items) + tax.total;
  
  // Prepare data for Google Sheets
// const firstItem = items[0];

// const rowData = [
//   invoiceNumber,
//   invoiceDate,
//   buyerDetails.name,
//   buyerDetails.address,
//   buyerDetails.gstin,
//   buyerDetails.state,
//   buyerDetails.stateCode,
//   firstItem.id.toString(),
//   firstItem.particulars,
//   firstItem.hsn,
//   firstItem.quantity.toString(),
//   firstItem.rate.toString(),
//   firstItem.amount.toString(),
//   calculateTotal(items).toFixed(2),
//   tax.cgst.toFixed(2),
//   tax.sgst.toFixed(2),
//   tax.igst.toFixed(2),
//   total.toFixed(2)
// ];

  
// console.log("Data to Google Sheets:", JSON.stringify({ values: rowData }));

//   // Google Sheets API call
// const proxyUrl = "https://corsproxy.io/?";
// const scriptUrl = "https://script.google.com/macros/s/AKfycbxidezDDeCf5y_-52uhOFh47Esum-O26PZ6POlbhCjN9z-bA353RC73Q3AD5UsjYV1g/exec";

// const response = await fetch(scriptUrl, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'text/plain',
//   },
//   body: JSON.stringify({
//     values: rowData // note: now this is an array of arrays
//   }),
// });



// if (!response.ok) {
//   const errorData = await response.text();
//   throw new Error(`Google Sheets API error: ${errorData}`);
// }

// Remove the firstItem logic and loop through all items
const responses = [];

for (let i = 0; i < items.length; i++) {
  const currentItem = items[i];
  
  const rowData = [
    invoiceNumber,
    invoiceDate,
    buyerDetails.name,
    buyerDetails.address,
    buyerDetails.gstin,
    buyerDetails.state,
    buyerDetails.stateCode,
    currentItem.id.toString(),
    currentItem.particulars,
    currentItem.hsn,
    currentItem.quantity.toString(),
    currentItem.rate.toString(),
    currentItem.amount.toString(),
    calculateTotal(items).toFixed(2),
    tax.cgst.toFixed(2),
    tax.sgst.toFixed(2),
    tax.igst.toFixed(2),
    total.toFixed(2)
  ];

  console.log(`Data to Google Sheets (Item ${i + 1}):`, JSON.stringify({ values: rowData }));

  // Google Sheets API call for each item
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxidezDDeCf5y_-52uhOFh47Esum-O26PZ6POlbhCjN9z-bA353RC73Q3AD5UsjYV1g/exec";

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Changed to apsplication/json
      },
      body: JSON.stringify({
        values: rowData
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google Sheets API error for item ${i + 1}: ${errorData}`);
    }

    const result = await response.json();
    responses.push(result);
    console.log(`Item ${i + 1} saved successfully:`, result);

  } catch (error) {
    console.error(`Error saving item ${i + 1}:`, error);
    throw error; // Re-throw to stop the process if any item fails
  }
}

console.log(`Successfully saved ${items.length} items to Google Sheets`);

  return true;
};
