
export interface InvoiceItem {
  id: number;
  particulars: string;
  hsn: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BuyerDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
}

export interface SellerDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
}

export interface TaxCalculation {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}
