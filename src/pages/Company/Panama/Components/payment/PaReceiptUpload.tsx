import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { paymentApi } from '@/lib/api/payment';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { paFormWithResetAtom } from '../../PaState';

interface ReceiptUploadProps { sessionId: string; }

export default function PaReceiptUpload({ sessionId }: ReceiptUploadProps) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useAtom(paFormWithResetAtom);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

   const handleUpload = async () => {
  if (!file) return;

  const docId = formData._id;
  if (!docId) {
    console.error('Company record ID is not set');
    return;
  }

  try {
    setUploadStatus('uploading');

    const output = await paymentApi.uploadReceipt(sessionId, docId, file, 'pa');
    console.log("data---->", output);

    if (output.message === "Receipt uploaded successfully") {
      setFormData(output.result);
      setUploadStatus('success');
    } else {
      setUploadStatus('error');
    }
  } catch (error) {
    console.error('Upload failed:', error);
    setUploadStatus('error');
  }
};
  // console.log("formData.receiptUrl",status)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('payment.uploadPReceipt')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.receiptUrl && (
          <div className="border p-2 rounded-lg">
            <iframe
              src={formData.receiptUrl}
              className="w-full h-64 border rounded-lg"
              title="Payment Receipt"
            />
          </div>
        )}
        {formData.receiptUrl === "" && (<div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
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
        </div>)}


        {file && (
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
          >
            {uploadStatus === 'uploading'
              ? 'Uploading...'
              : uploadStatus === 'success'
                ? 'Upload Successful'
                : 'Submit Receipt'}
          </Button>
        )}

        {uploadStatus === 'success' && (
          <p className="text-sm text-green-600 text-center">
            {t('payment.uploadPReceiptSuccess')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
