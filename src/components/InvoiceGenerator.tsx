
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface InvoiceItem {
  id: number;
  particulars: string;
  hsn: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BuyerDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
}

interface SellerDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
}

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

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    const total = calculateTotal();
    const isSameState = sellerDetails.state === buyerDetails.state;
    
    if (isSameState) {
      const cgst = Math.round(total * 0.09);
      const sgst = Math.round(total * 0.09);
      return { cgst, sgst, igst: 0, total: cgst + sgst };
    } else {
      const igst = Math.round(total * 0.18);
      return { cgst: 0, sgst: 0, igst, total: igst };
    }
  };

  const generatePDF = () => {
    if (!invoiceNumber || !buyerDetails.name) {
      toast.error('Please fill in invoice number and buyer details');
      return;
    }

    const doc = new jsPDF();
    const tax = calculateTax();
    const subtotal = calculateTotal();
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
    doc.text(`STATE: ${buyerDetails.state}`, 142, 78);
    doc.text(`CODE: ${buyerDetails.stateCode}`, 142, 84);

    // Buyer details
    doc.text('Details of Receiver Billed to:', 20, 70);
    doc.text(`Name: ${buyerDetails.name}`, 20, 77);
    doc.text(`Address: ${buyerDetails.address}`, 20, 84);
    doc.text(`GSTIN: ${buyerDetails.gstin}`, 20, 91);
    doc.text(`STATE: ${buyerDetails.state}    STATE CODE: ${buyerDetails.stateCode}`, 20, 98);

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
      doc.text(`CGST %: ${tax.cgst.toFixed(2)}`, 140, finalY + 10);
      doc.text(`SGST %: ${tax.sgst.toFixed(2)}`, 140, finalY + 17);
    } else {
      doc.text(`IGST %: ${tax.igst.toFixed(2)}`, 140, finalY + 10);
    }

    doc.text(`Round Off: 0.00`, 140, finalY + 24);
    doc.text(`TOTAL: ${grandTotal.toFixed(2)}`, 140, finalY + 31);

    // Footer notes
    doc.text('N.B.: Goods once sold will not be taken back.', 20, finalY + 40);
    doc.text('Received the above-mentioned goods in good order &', 20, finalY + 47);
    doc.text('condition.', 20, finalY + 54);

    doc.text(`For, ${sellerDetails.name}`, 140, finalY + 60);
    doc.text("Receiver's Signature", 20, finalY + 70);

    doc.save(`Invoice-${invoiceNumber}.pdf`);
    toast.success('PDF generated successfully!');
  };

  const saveToGoogleSheets = async () => {
    if (!googleSheetsUrl) {
      toast.error('Please provide Google Sheets URL');
      return;
    }

    try {
      // This would require actual Google Sheets API implementation
      toast.success('Data saved to Google Sheets (simulation)');
      console.log('Invoice data:', { invoiceNumber, buyerDetails, items, total: calculateTotal() });
    } catch (error) {
      toast.error('Failed to save to Google Sheets');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Invoice Generator</h1>
        <p className="text-gray-600">Generate professional tax invoices with GST calculations</p>
      </div>

      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seller Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Details (Seller)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="sellerName">Company Name</Label>
            <Input
              id="sellerName"
              value={sellerDetails.name}
              onChange={(e) => setSellerDetails({ ...sellerDetails, name: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="sellerAddress">Address</Label>
            <Input
              id="sellerAddress"
              value={sellerDetails.address}
              onChange={(e) => setSellerDetails({ ...sellerDetails, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sellerGstin">GSTIN</Label>
            <Input
              id="sellerGstin"
              value={sellerDetails.gstin}
              onChange={(e) => setSellerDetails({ ...sellerDetails, gstin: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sellerState">State</Label>
            <Input
              id="sellerState"
              value={sellerDetails.state}
              onChange={(e) => setSellerDetails({ ...sellerDetails, state: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sellerStateCode">State Code</Label>
            <Input
              id="sellerStateCode"
              value={sellerDetails.stateCode}
              onChange={(e) => setSellerDetails({ ...sellerDetails, stateCode: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Buyer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Buyer Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="buyerName">Name *</Label>
            <Input
              id="buyerName"
              value={buyerDetails.name}
              onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
              placeholder="Enter buyer name"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="buyerAddress">Address</Label>
            <Input
              id="buyerAddress"
              value={buyerDetails.address}
              onChange={(e) => setBuyerDetails({ ...buyerDetails, address: e.target.value })}
              placeholder="Enter buyer address"
            />
          </div>
          <div>
            <Label htmlFor="buyerGstin">GSTIN</Label>
            <Input
              id="buyerGstin"
              value={buyerDetails.gstin}
              onChange={(e) => setBuyerDetails({ ...buyerDetails, gstin: e.target.value })}
              placeholder="Enter GSTIN"
            />
          </div>
          <div>
            <Label htmlFor="buyerState">State</Label>
            <Input
              id="buyerState"
              value={buyerDetails.state}
              onChange={(e) => setBuyerDetails({ ...buyerDetails, state: e.target.value })}
              placeholder="Enter state"
            />
          </div>
          <div>
            <Label htmlFor="buyerStateCode">State Code</Label>
            <Input
              id="buyerStateCode"
              value={buyerDetails.stateCode}
              onChange={(e) => setBuyerDetails({ ...buyerDetails, stateCode: e.target.value })}
              placeholder="Enter state code"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Invoice Items
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2">Sr. No.</th>
                  <th className="border border-gray-300 p-2">Particulars</th>
                  <th className="border border-gray-300 p-2">HSN</th>
                  <th className="border border-gray-300 p-2">Quantity</th>
                  <th className="border border-gray-300 p-2">Rate</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                  <th className="border border-gray-300 p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        value={item.particulars}
                        onChange={(e) => updateItem(item.id, 'particulars', e.target.value)}
                        placeholder="Enter particulars"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        value={item.hsn}
                        onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                        placeholder="HSN code"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Rate"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-semibold">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const subtotal = calculateTotal();
            const tax = calculateTax();
            const grandTotal = subtotal + tax.total;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {tax.cgst > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (9%):</span>
                        <span className="font-semibold">₹{tax.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (9%):</span>
                        <span className="font-semibold">₹{tax.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST (18%):</span>
                      <span className="font-semibold">₹{tax.igst.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-l pl-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      Total: ₹{grandTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {sellerDetails.state === buyerDetails.state 
                        ? 'Same State (CGST + SGST)' 
                        : 'Different State (IGST)'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Google Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Google Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="googleSheetsUrl">Google Sheets URL</Label>
            <Input
              id="googleSheetsUrl"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="Enter Google Sheets URL"
            />
          </div>
          <div>
            <Label htmlFor="driveApiKey">Google Drive API Key</Label>
            <Input
              id="driveApiKey"
              type="password"
              value={driveApiKey}
              onChange={(e) => setDriveApiKey(e.target.value)}
              placeholder="Enter Drive API key"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
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
