import React,{ useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { paymentApi } from '@/lib/api/payment';

interface ReceiptUploadProps {
    sessionId: string;
  }

export function ReceiptUpload({ sessionId }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile)  setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    const docId = localStorage.getItem('companyRecordId');

    setUploadStatus('uploading');
    // Simulate upload - replace with actual upload logic
    await paymentApi.uploadReceipt(sessionId,docId, file);
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Payment Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="receipt-upload"
          />
          <label
            htmlFor="receipt-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {file ? file.name : 'Click to upload receipt'}
            </span>
          </label>
        </div>
        
        {file && (
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={uploadStatus === 'uploading'}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 
             uploadStatus === 'success' ? 'Upload Successful' : 
             'Submit Receipt'}
          </Button>
        )}
        
        {uploadStatus === 'success' && (
          <p className="text-sm text-green-600 text-center">
            Receipt uploaded successfully. Our team will verify it shortly.
          </p>
        )}
      </CardContent>
    </Card>
  );
}