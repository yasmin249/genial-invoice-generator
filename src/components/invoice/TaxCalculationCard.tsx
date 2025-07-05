
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaxCalculation } from '@/types/invoice';

interface TaxCalculationCardProps {
  subtotal: number;
  tax: TaxCalculation;
  isSameState: boolean;
}

const TaxCalculationCard = ({ subtotal, tax, isSameState }: TaxCalculationCardProps) => {
  const grandTotal = subtotal + tax.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Calculation</CardTitle>
      </CardHeader>
      <CardContent>
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
                {isSameState 
                  ? 'Same State (CGST + SGST)' 
                  : 'Different State (IGST)'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxCalculationCard;
