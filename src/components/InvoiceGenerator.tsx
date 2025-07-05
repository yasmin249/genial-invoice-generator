
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceItem, BuyerDetails, SellerDetails } from '@/types/invoice';
import { calculateTotal, calculateTax } from '@/utils/invoiceCalculations';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { saveInvoiceToGoogleSheets } from '@/utils/googleSheetsIntegration';
import InvoiceHeader from './invoice/InvoiceHeader';
import SellerDetailsCard from './invoice/SellerDetailsCard';
import BuyerDetailsCard from './invoice/BuyerDetailsCard';
import InvoiceItemsTable from './invoice/InvoiceItemsTable';
import TaxCalculationCard from './invoice/TaxCalculationCard';
import GoogleIntegrationCard from './invoice/GoogleIntegrationCard';

const InvoiceGenerator = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [sellerDetails, setSellerDetails] = useState<SellerDetails>({
    name: 'HAYA ENGINEERING',
    address: '8, Paradise complex opp. Lalita Garage, Maninagar, Ahmedabad-380001',
    gstin: '24AACPH8224G1Z7',
    state: 'GUJARAT',
    stateCode: '24'
  });

  const [buyerDetails, setBuyerDetails] = useState<BuyerDetails>({
    name: '',
    address: '',
    gstin: '',
    state: '',
    stateCode: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, particulars: '', hsn: '', quantity: 0, rate: 0, amount: 0 }
  ]);

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [driveApiKey, setDriveApiKey] = useState('');

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems([...items, { id: newId, particulars: '', hsn: '', quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const generatePDF = () => {
    try {
      if (!invoiceNumber || !buyerDetails.name) {
        toast.error('Please fill in invoice number and buyer details');
        return;
      }

      console.log('Starting PDF generation...');
      
      const tax = calculateTax(items, sellerDetails, buyerDetails);
      const doc = generateInvoicePDF(invoiceNumber, invoiceDate, sellerDetails, buyerDetails, items, tax);

      console.log('PDF generated successfully');
      doc.save(`Invoice-${invoiceNumber}.pdf`);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Check console for details.');
    }
  };

  const saveToGoogleSheets = async () => {
    if (!googleSheetsUrl || !driveApiKey) {
      toast.error('Please provide Google Sheets URL and API Key');
      return;
    }

    try {
      console.log('Attempting to save to Google Sheets...');
      
      const tax = calculateTax(items, sellerDetails, buyerDetails);
      await saveInvoiceToGoogleSheets(
        invoiceNumber, 
        invoiceDate, 
        sellerDetails, 
        buyerDetails, 
        items, 
        tax, 
        googleSheetsUrl, 
        driveApiKey
      );

      console.log('Successfully saved to Google Sheets');
      toast.success('Data saved to Google Sheets successfully!');
    } catch (error) {
      console.error('Google Sheets save error:', error);
      toast.error('Failed to save to Google Sheets. Check console for details.');
    }
  };

  const subtotal = calculateTotal(items);
  const tax = calculateTax(items, sellerDetails, buyerDetails);
  const isSameState = sellerDetails.state.toLowerCase() === buyerDetails.state.toLowerCase();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Invoice Generator</h1>
        <p className="text-gray-600">Generate professional tax invoices with GST calculations</p>
      </div>

      <InvoiceHeader
        invoiceNumber={invoiceNumber}
        invoiceDate={invoiceDate}
        onInvoiceNumberChange={setInvoiceNumber}
        onInvoiceDateChange={setInvoiceDate}
      />

      <SellerDetailsCard
        sellerDetails={sellerDetails}
        onSellerDetailsChange={setSellerDetails}
      />

      <BuyerDetailsCard
        buyerDetails={buyerDetails}
        onBuyerDetailsChange={setBuyerDetails}
      />

      <InvoiceItemsTable
        items={items}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
      />

      <TaxCalculationCard
        subtotal={subtotal}
        tax={tax}
        isSameState={isSameState}
      />

      <GoogleIntegrationCard
        googleSheetsUrl={googleSheetsUrl}
        driveApiKey={driveApiKey}
        onGoogleSheetsUrlChange={setGoogleSheetsUrl}
        onDriveApiKeyChange={setDriveApiKey}
      />

      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={generatePDF} size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-5 w-5 mr-2" />
          Generate PDF
        </Button>
        <Button onClick={saveToGoogleSheets} variant="outline" size="lg">
          Save to Google Sheets
        </Button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
