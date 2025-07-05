
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SellerDetails } from '@/types/invoice';

interface SellerDetailsCardProps {
  sellerDetails: SellerDetails;
  onSellerDetailsChange: (details: SellerDetails) => void;
}

const SellerDetailsCard = ({ sellerDetails, onSellerDetailsChange }: SellerDetailsCardProps) => {
  return (
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
            onChange={(e) => onSellerDetailsChange({ ...sellerDetails, name: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="sellerAddress">Address</Label>
          <Input
            id="sellerAddress"
            value={sellerDetails.address}
            onChange={(e) => onSellerDetailsChange({ ...sellerDetails, address: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="sellerGstin">GSTIN</Label>
          <Input
            id="sellerGstin"
            value={sellerDetails.gstin}
            onChange={(e) => onSellerDetailsChange({ ...sellerDetails, gstin: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="sellerState">State</Label>
          <Input
            id="sellerState"
            value={sellerDetails.state}
            onChange={(e) => onSellerDetailsChange({ ...sellerDetails, state: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="sellerStateCode">State Code</Label>
          <Input
            id="sellerStateCode"
            value={sellerDetails.stateCode}
            onChange={(e) => onSellerDetailsChange({ ...sellerDetails, stateCode: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerDetailsCard;
