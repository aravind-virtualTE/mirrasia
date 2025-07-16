import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { t } from "i18next";
import { useAtom } from "jotai";
import React, { useEffect, useMemo } from "react";
import { paFormWithResetAtom, paPriceAtom } from "../PaState";
import { t } from "i18next";

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
        description: ("panama.nomineDir"),
        quantity: 1,
        unitPrice: directorPrice,
        amountUSD: directorPrice,
      });
    }

    if (ownerOnlyPrice > 0) {
      nomineeServices.push({
        id: 101,
        description: (`panama.shldrNominee`),
        quantity: 1,
        unitPrice: ownerOnlyPrice,
        amountUSD: ownerOnlyPrice,
      });
    }

    const baseInvoice: InvoiceItem[] = [
      {
        id: 1,
        description: (`panama.panam1stYrDesc`),
        details: [
          {
            key: "registration_fees",
            value:(`panama.details.1`),
          },
          {
            key: "incorporation_deed",
            value:(`panama.details.2`),
          },
          {
            key: "first_subscriber",
            value: (`panama.details.3`),
          },
          {
            key: "notary_fees",
            value: (`panama.details.4`),
          },
          {
            key: "filing_deed",
            value: (`panama.details.5`),
          },
          {
            key: "subscribers_resolution",
            value: (`panama.details.6`),
          },
          {
            key: "company_bylaws",
            value: (`panama.details.7`),
          },
          {
            key: "juristic_certificate",
            value: (`panama.details.8`),
          },
          {
            key: "english_translation",
            value: (`panama.details.9`),
          },
          {
            key: "board_minutes",
            value: (`panama.details.10`),
          },
          {
            key: "share_register",
            value:(`panama.details.11`),
          },
          {
            key: "share_certificates",
            value: (`panama.details.12`),
          },
          {
            key: "incumbency_certificate",
            value: (`panama.details.13`),
          },
          {
            key: "registered_office",
            value: (`panama.details.14`),
          },
          {
            key: "registered_agent",
            value: (`panama.details.15`),
          },
          {
            key: "apostilled_docs",
            value:(`panama.details.16`),
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
        <CardTitle>{t("panama.mirrBsnsAdvcmpLtd")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("invoice.desc")}</TableHead>
              <TableHead>{t("panama.qty")}</TableHead>
              <TableHead>{t("panama.unitPrice")}</TableHead>
              <TableHead>{t("panama.discount")}</TableHead>
              <TableHead>{t("panama.amtUsd")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">{t(item.description)}</div>
                    {item.details && (
                      <ul className="list-none pl-0 mt-1 mb-0 text-xs leading-tight">
                        {item.details.map((detail, index) => (
                          <li key={index} className="py-0.5">- {t(detail.value)}</li>
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
                <span className="text-green-600">{t("panama.ttlUsd")}:</span>
                <span className="font-bold text-green-600">{totalAmount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
