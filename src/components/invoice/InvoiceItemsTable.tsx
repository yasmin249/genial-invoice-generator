
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { InvoiceItem } from '@/types/invoice';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: number) => void;
  onUpdateItem: (id: number, field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItemsTable = ({ items, onAddItem, onRemoveItem, onUpdateItem }: InvoiceItemsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Invoice Items
          <Button onClick={onAddItem} size="sm">
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
                      onChange={(e) => onUpdateItem(item.id, 'particulars', e.target.value)}
                      placeholder="Enter particulars"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={item.hsn}
                      onChange={(e) => onUpdateItem(item.id, 'hsn', e.target.value)}
                      placeholder="HSN code"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => onUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
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
                      onClick={() => onRemoveItem(item.id)}
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
  );
};

export default InvoiceItemsTable;
