
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BuyerDetails } from '@/types/invoice';

interface BuyerDetailsCardProps {
  buyerDetails: BuyerDetails;
  onBuyerDetailsChange: (details: BuyerDetails) => void;
}

const BuyerDetailsCard = ({ buyerDetails, onBuyerDetailsChange }: BuyerDetailsCardProps) => {
  return (
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
            onChange={(e) => onBuyerDetailsChange({ ...buyerDetails, name: e.target.value })}
            placeholder="Enter buyer name"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="buyerAddress">Address</Label>
          <Input
            id="buyerAddress"
            value={buyerDetails.address}
            onChange={(e) => onBuyerDetailsChange({ ...buyerDetails, address: e.target.value })}
            placeholder="Enter buyer address"
          />
        </div>
        <div>
          <Label htmlFor="buyerGstin">GSTIN</Label>
          <Input
            id="buyerGstin"
            value={buyerDetails.gstin}
            onChange={(e) => onBuyerDetailsChange({ ...buyerDetails, gstin: e.target.value })}
            placeholder="Enter GSTIN"
          />
        </div>
        <div>
          <Label htmlFor="buyerState">State</Label>
          <Input
            id="buyerState"
            value={buyerDetails.state}
            onChange={(e) => onBuyerDetailsChange({ ...buyerDetails, state: e.target.value })}
            placeholder="Enter state (e.g., gujarat or GUJARAT)"
          />
        </div>
        <div>
          <Label htmlFor="buyerStateCode">State Code</Label>
          <Input
            id="buyerStateCode"
            value={buyerDetails.stateCode}
            onChange={(e) => onBuyerDetailsChange({ ...buyerDetails, stateCode: e.target.value })}
            placeholder="Enter state code"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerDetailsCard;
