
import { InvoiceItem, TaxCalculation, SellerDetails, BuyerDetails } from '@/types/invoice';

export const calculateTotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateTax = (
  items: InvoiceItem[], 
  sellerDetails: SellerDetails, 
  buyerDetails: BuyerDetails
): TaxCalculation => {
  const total = calculateTotal(items);
  const isSameState = sellerDetails.state.toLowerCase() === buyerDetails.state.toLowerCase();
  
  if (isSameState) {
    const cgst = Math.round(total * 0.09);
    const sgst = Math.round(total * 0.09);
    return { cgst, sgst, igst: 0, total: cgst + sgst };
  } else {
    const igst = Math.round(total * 0.18);
    return { cgst: 0, sgst: 0, igst, total: igst };
  }
};
