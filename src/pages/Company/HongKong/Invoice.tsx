import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useAtom } from "jotai";
import { companyIncorporateInvoiceAtom } from "@/services/state";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

interface InvoiceData {
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</CardTitle>
        <Badge variant="secondary">
          Generated: {new Date(invoiceData.metadata.generatedAt).toLocaleDateString()}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Invoice Items */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Original Price</TableHead>
              <TableHead className="text-right">Discounted Price</TableHead>
              <TableHead className="text-right">Notes</TableHead>
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
                <span>Total (Original):</span>
                <span className="font-semibold">
                  {formatCurrency(invoiceData.totals.original.replace('USD ', ''))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Total (Discounted):</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(invoiceData.totals.discounted.replace('USD ', ''))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metadata */}
        <div className="mt-4 text-sm text-muted-foreground flex justify-between">
          <div>
            <p>Shareholders:
              {invoiceData.customer.shareholderCount.legalPerson} Legal Persons,
              {invoiceData.customer.shareholderCount.individual} Individuals
            </p>
          </div>
        </div>
        {/* Payment Terms and Conditions */}
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="payment-terms">
            <AccordionTrigger>Payment Terms and Conditions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">1. Payment Condition</h4>
                  <p>100% in advance</p>
                </div>
                <div>
                  <h4 className="font-semibold">2. Payment Methods</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Bank Transfer or Telegraphic Transfer:</strong>
                      <ul className="list-none pl-5">
                        <li>Beneficiary Bank Name: HSBC</li>
                        <li>Account No.: 817 245681 838</li>
                        <li>Beneficiary Name: MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</li>
                        <li>HSBC Address: 1 Queen's Road, Central, Hong Kong</li>
                        <li>Bank Code: 004</li>
                        <li>Swift Code: HSBCHKHHHKH (FOR HKD ACCOUNT)</li>
                        <li>Swift Code: HSBCHKHHXXX (FOR USD ACCOUNT OR OTHER FOREIGN CURRENCIES)</li>
                        <li>Bank Charges: All charges are borne by the remitter</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Cheque:</strong> Payable to "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED"
                    </li>
                    <li>
                      <strong>Card:</strong> Stripe Payments will be charged a 3.5% Processing Fee
                    </li>
                    <li>
                      <strong>PayPal:</strong> Payments will be charged a 4.5% Processing Fee
                    </li>
                    <li>
                      <strong>Fast Payment System (FPS):</strong>
                      <ul className="list-none pl-5">
                        <li>Proxy ID: 9400086</li>
                        <li>Email: biz.support@mirrasia.com</li>
                        <li>Mobile: 90218363</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">3. Refund Policy</h4>
                  <p>All payments are NON-REFUNDABLE.</p>
                </div>
                <div>
                  <h4 className="font-semibold">4. Payment Charges</h4>
                  <p>The remitter bears all charges of payment, which includes the remittance amount, beneficiary bank's charges, as well as all the other banks' fees (intermediary bank, etc).</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default function Invoice() {
  const [corpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  const invoiceData = corpoInvoiceAtom[0] as unknown as InvoiceData;

  return <InvoiceComponent invoiceData={invoiceData} />;
}