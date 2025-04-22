import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useAtom } from "jotai";
import { companyIncorporateInvoiceAtom } from "@/services/state";
import { useTranslation } from "react-i18next";
// Define types for the invoice data structure
interface InvoiceItem {
  description: string;
  originalPrice: string;
  discountedPrice: string;
  quantity: number;
  totalOriginal: string;
  totalDiscounted: string;
  note: string | null;
}

interface ShareholderCount {
  legalPerson: number;
  individual: number;
}

interface InvoiceTotals {
  original: string;
  discounted: string;
}

interface InvoiceMetadata {
  generatedAt: string;
  correspondenceCount: number;
}

export interface InvoiceData {
  items: InvoiceItem[];
  totals: InvoiceTotals;
  customer: {
    shareholderCount: ShareholderCount;
  };
  metadata: InvoiceMetadata;
}

interface InvoiceComponentProps {
  invoiceData: InvoiceData;
}

const InvoiceComponent: React.FC<InvoiceComponentProps> = ({ invoiceData }) => {
  const formatCurrency = (value: string): string => `USD ${parseFloat(value).toFixed(2)}`;
      const { t } = useTranslation();
  

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</CardTitle>
        <Badge variant="secondary">
          {/* Generated: {new Date(invoiceData.metadata.generatedAt).toLocaleDateString()} */}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Invoice Items */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invoice.originalPrice')}</TableHead>
              <TableHead className="text-right">{t('invoice.originalPrice')}</TableHead>
              <TableHead className="text-right">{t('invoice.discPrice')}</TableHead>
              <TableHead className="text-right">{t('invoice.notes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(item.originalPrice)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.discountedPrice)}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {item.note && (
                    <div className="flex items-center justify-end gap-1">
                      <Info size={12} className="text-blue-500" />
                      {item.note}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals Section */}
        <div className="mt-4 flex justify-end">
          <Card className="w-64">
            <CardContent className="pt-4">
              <div className="flex justify-between mb-2">
                <span className="font-xs text-xs line-through text-gray-500">{t('invoice.total')}:</span>
                <span className="font-xs text-xs line-through text-gray-500">
                  {formatCurrency(invoiceData.totals.original.replace('USD ', ''))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">{t('invoice.totalDisc')}:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(invoiceData.totals.discounted.replace('USD ', ''))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Invoice() {
  const [corpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  const invoiceData = corpoInvoiceAtom[0] as unknown as InvoiceData;
  // console.log("corpoInvoiceAtom",invoiceData)
  return <InvoiceComponent invoiceData={invoiceData} />;
}