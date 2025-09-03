/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from "lucide-react";
import { fetchInvoicesOrders } from "./memberDirShareholder";

interface LineItem {
  label: string;
  qty: number;
  unit: number;
  amount: number;
}

interface PaymentData {
  _id: string;
  userId: string;
  companyId: string;
  cartFingerprint: string;
  lines: LineItem[];
  currency: string;
  subtotalCents: number;
  cardFeeCents: number;
  totalCents: number;
  summary: string;
  payMethod: "card" | "bank" | string;
  status: string;
  timeline: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  stripe?: {
    paymentIntentId: string;
    clientSecret: string;
    lastStatus: string;
    receiptUrl?: string;
  };
  bank?: {
    proof?: {
      url: string;
      uploadedAt: string;
      filename: string;
      mimetype: string;
      size: number;
    };
    reference?: string;
  };
}

const InvoiceOrdersTableView = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<PaymentData[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response: PaymentData[] = await fetchInvoicesOrders();
        console.log("Fetched orders:", response);
      
        const filtered = (response || []).filter((order) => {
          const isCardPaid =
            order.payMethod === "card" &&
            order.status === "paid" &&
            order.stripe?.lastStatus === "succeeded";

          const isBankWithProof =
            ["bank_proof_submitted", "bank_verified", "bank_rejected"].includes(order.status) &&
            !!order.bank?.proof?.url?.trim();

          return isCardPaid || isBankWithProof;
        });

        // optional: newest first
        filtered.sort(
          (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
        );

        setOrders(filtered);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    };
    loadOrders();
  }, []);

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const formatCurrency = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);

  const getReceiptUrl = (item: PaymentData) => {
    if (item.stripe?.lastStatus === "succeeded" && item.stripe.receiptUrl) {
      return item.stripe.receiptUrl;
    }
    if (item.bank?.proof?.url && item.status.includes("bank")) {
      return item.bank.proof.url;
    }
    return null;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Company ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((item) => {
          const isExpanded = expandedRows.has(item._id);
          const receiptUrl = getReceiptUrl(item);

          return (
            <React.Fragment key={item._id}>
              <TableRow className="cursor-pointer" onClick={() => toggleRow(item._id)}>
                <TableCell className="w-10">
                  <Button variant="ghost" size="icon">
                    {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{item.companyId}</TableCell>
                <TableCell>{formatCurrency(item.totalCents, item.currency)}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "paid" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.payMethod}</TableCell>
                <TableCell>
                  {receiptUrl && (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-blue-600 hover:underline"
                    >
                      View <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </TableCell>
              </TableRow>

              {isExpanded && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-muted/50 p-4">
                    <div className="grid gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Order Summary</h4>
                        <p className="text-sm">{item.summary}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Line Items</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Unit Price</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.lines.map((line, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{line.label}</TableCell>
                                <TableCell className="text-right">{line.qty}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(line.unit * 100, item.currency)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(line.amount * 100, item.currency)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                        <div className="text-right">Subtotal:</div>
                        <div className="text-right font-medium">
                          {formatCurrency(item.subtotalCents, item.currency)}
                        </div>
                        <div className="text-right">Fees:</div>
                        <div className="text-right font-medium">
                          {formatCurrency(item.cardFeeCents, item.currency)}
                        </div>
                        <div className="text-right font-semibold">Total:</div>
                        <div className="text-right font-semibold">
                          {formatCurrency(item.totalCents, item.currency)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default InvoiceOrdersTableView;
