import React, { useEffect } from 'react'
import { useAtom } from "jotai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { sgFormWithResetAtom, sgPrice } from '../SgState'
import { service_list } from './sgConstant'

const InvoiceSg: React.FC = () => {
  const [formData] = useAtom(sgFormWithResetAtom)
  const [, setUsPrice] = useAtom(sgPrice)

  // const selectedServices = formData.serviceItemsSelected

    const addressList = formData.businessAddress
    const shareholderList = formData.shareHolders
    const directorsList = formData.directors

    let serviceFees = service_list.map((service) => ({
        id: service.id,
        description: service.key,
        originalPrice: service.price,
        discountedPrice: service.price,
        isHighlight: false,
        note: ''
    }))

    if (addressList && addressList.id === "mirrasiaAddress") {
        serviceFees = [
            ...serviceFees,
            {
                id: "registeredBusinessAddress",
                description:
                    "Registered business address service for one year",
                originalPrice: 350,
                discountedPrice: 350,
                isHighlight: false,
                note: ''
            },
        ];
    }

      const legalEntityYesCount = shareholderList.filter((item: { legalEntity: { id: string } }) => item.legalEntity?.id === "Yes").length + directorsList.filter((item) => item.legalEntity?.id === "Yes").length;

    if (legalEntityYesCount > 0) {
        serviceFees = [
            ...serviceFees,
            {
                id: "corporateSecretaryAnnualService",
                description: `Corporate Secretary annual service (${legalEntityYesCount})`,
                originalPrice: legalEntityYesCount * 550.0,
                discountedPrice: legalEntityYesCount * 550.0,
                isHighlight: false,
                note: ''
            },
        ];
    }
    if(formData.onlineAccountingSoftware?.value === "yes") {
        serviceFees = [
            ...serviceFees,
            {
                id: "onlineAccountingSoftware",
                description: "Accounting package for 6 months (No of transaction is less than 120) - Prepayment",
                originalPrice: 2000.00,
                discountedPrice: 2000.00,
                isHighlight: false,
                note: ''
            },
        ];
    }


  const totalOriginal = serviceFees.reduce((sum, item) => sum + Number(item.originalPrice), 0)
  const totalDiscounted = serviceFees.reduce((sum, item) => sum + Number(item.discountedPrice), 0)
  console.log("Total Original Price:", totalOriginal)
  useEffect(() => {
    setUsPrice(totalDiscounted || 0)
  }, [totalDiscounted, setUsPrice])

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL SERVICES LIMITED</CardTitle>
        </CardHeader>
        <CardContent>
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
              {serviceFees.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={item.isHighlight ? "font-semibold" : ""}>{item.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.originalPrice > 0 ? `USD ${item.originalPrice}` : "USD 0.00"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.discountedPrice > 0 ? `USD ${item.discountedPrice}` : "USD 0.00"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{item.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Section */}
          <div className="mt-4 flex justify-end">
            <Card className="w-80">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-xs text-xs line-through text-gray-500">Total (Original):</span>
                  <span className="font-xs text-xs line-through text-gray-500">USD {totalOriginal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Total (Discounted):</span>
                  <span className="font-bold">USD {totalDiscounted.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InvoiceSg
