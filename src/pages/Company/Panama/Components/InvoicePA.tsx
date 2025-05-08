import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { t } from "i18next";
import { useAtom } from "jotai";
import React, { useEffect, useMemo } from "react";
import { paFormWithResetAtom, paPriceAtom } from "../PaState";

type InvoiceItem = {
  id: number;
  description: string;
  details?: { key: string; value: string }[];
  quantity: number;
  unitPrice: number;
  discount?: number;
  amountUSD: number;
};

export default function InvoicePA() {
  const [formData] = useAtom(paFormWithResetAtom);
    const [, setPaPrice] = useAtom(paPriceAtom)
  
  const nomineeList = formData.legalDirectors || [];

  const invoiceData: InvoiceItem[] = useMemo(() => {
    const ownerOnly = nomineeList.filter((n) => n.ownershipRate > 0);

    // Determine price for nominee directors
    let directorPrice = 0;
    const directorCount = nomineeList.length;
    if (directorCount === 1) directorPrice = 1200;
    else if (directorCount === 2) directorPrice = 1700;
    else if (directorCount === 3) directorPrice = 2200;

    // Price for owner-only (not director)
    const ownerOnlyPrice = ownerOnly.length * 1300;

    const nomineeServices: InvoiceItem[] = [];
    if (directorPrice > 0) {
      nomineeServices.push({
        id: 100,
        description: `NOMINEE DIRECTOR SERVICE (${directorCount} PERSON${directorCount > 1 ? "S" : ""})`,
        quantity: 1,
        unitPrice: directorPrice,
        amountUSD: directorPrice,
      });
    }

    if (ownerOnlyPrice > 0) {
      nomineeServices.push({
        id: 101,
        description: `NOMINEE SHAREHOLDER WITH OWNERSHIP (${ownerOnly.length} PERSON${ownerOnly.length > 1 ? "S" : ""})`,
        quantity: 1,
        unitPrice: ownerOnlyPrice,
        amountUSD: ownerOnlyPrice,
      });
    }

    const baseInvoice: InvoiceItem[] = [
      {
        id: 1,
        description: "PANAMA CORPORATION FORMATION AND FIRST-YEAR CORPORATE SERVICES",
        details: [
          {
            key: "registration_fees",
            value: "All applicable Registration and Government Fees (Registro Publico)",
          },
          {
            key: "incorporation_deed",
            value: "Preparing the Incorporation Deed and Articles of Incorporation (Spanish)",
          },
          {
            key: "first_subscriber",
            value: "Acting as the First Subscriber and executing the Incorporation Deed before Notary",
          },
          {
            key: "notary_fees",
            value: "All applicable Notary Fees",
          },
          {
            key: "filing_deed",
            value: "Filing the Incorporation's Notarial Deed with the Commercial Register",
          },
          {
            key: "subscribers_resolution",
            value: "Preparing Subscriber's Resolution for the Appointment of Directors and Resignation of Subscriber's Rights",
          },
          {
            key: "company_bylaws",
            value: "Preparing the Company Bylaws",
          },
          {
            key: "juristic_certificate",
            value: "Providing the Certificate of Juristic Person, and Company Extract issued by the Registro Publico",
          },
          {
            key: "english_translation",
            value: "Providing a Certified English Translation of the Corporate Documents",
          },
          {
            key: "board_minutes",
            value: "Preparing the First Board Meeting Minutes for the allotment of Shares, the Appointment of Directors, Registered Agent and office, and other related matters",
          },
          {
            key: "share_register",
            value: "Preparing the Share Register Book",
          },
          {
            key: "share_certificates",
            value: "Preparing the Share Certificates",
          },
          {
            key: "incumbency_certificate",
            value: "Preparing and executing a Certificate of Incumbency",
          },
          {
            key: "registered_office",
            value: "Providing Registered Office Services, including business address, for one year",
          },
          {
            key: "registered_agent",
            value: "Providing Registered Agent Services for one year",
          },
          {
            key: "apostilled_docs",
            value: "Providing Notarized and Apostilled copies of the Corporate Documents",
          },
        ],
        quantity: 1.0,
        unitPrice: 3000.0,
        discount: 0,
        amountUSD: 3000.0,
      },
    ];

    return [...baseInvoice, ...nomineeServices];
  }, [nomineeList]);

  const totalAmount = invoiceData.reduce((sum, item) => sum + item.amountUSD, 0).toFixed(2);

    useEffect(() => {
      setPaPrice(Number(totalAmount) || 0)
    }, [totalAmount, setPaPrice])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Amount USD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">{item.description}</div>
                    {item.details && (
                      <ul className="list-none pl-0 mt-1 mb-0 text-xs leading-tight">
                        {item.details.map((detail, index) => (
                          <li key={index} className="py-0.5">- {detail.value}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{item.discount || "-"}</TableCell>
                  <TableCell>{item.amountUSD.toFixed(2)}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-end">
          <Card className="w-64">
            <CardContent className="pt-4">
              <div className="flex justify-between">
                <span className="text-green-600">Total USD:</span>
                <span className="font-bold text-green-600">{totalAmount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
