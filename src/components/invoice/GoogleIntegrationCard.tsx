
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoogleIntegrationCardProps {
  googleSheetsUrl: string;
  driveApiKey: string;
  onGoogleSheetsUrlChange: (value: string) => void;
  onDriveApiKeyChange: (value: string) => void;
}

const GoogleIntegrationCard = ({ 
  googleSheetsUrl, 
  driveApiKey, 
  onGoogleSheetsUrlChange, 
  onDriveApiKeyChange 
}: GoogleIntegrationCardProps) => {
  return (
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
            onChange={(e) => onGoogleSheetsUrlChange(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
        </div>
        <div>
          <Label htmlFor="driveApiKey">Google Sheets API Key</Label>
          <Input
            id="driveApiKey"
            type="password"
            value={driveApiKey}
            onChange={(e) => onDriveApiKeyChange(e.target.value)}
            placeholder="Enter Google Sheets API key"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleIntegrationCard;
